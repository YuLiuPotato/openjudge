import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

test('adding option descriptions preserves existing decisions and reviews', () => {
  const db = new DatabaseSync(':memory:');
  for (const name of ['0000_fat_nehzno.sql', '0001_first_raza.sql', '0002_complex_roxanne_simpson.sql']) {
    db.exec(readFileSync(new URL(`../drizzle/${name}`, import.meta.url), 'utf8'));
  }
  db.exec("INSERT INTO decisions (id,author_id,title,context,option_a,option_b,category,goal,risk,created_at) VALUES ('d','owner','问题','背景','方案A','方案B','其他','','',1)");
  db.exec("INSERT INTO reviews (id,decision_id,author_id,choice,angle,reason,created_at) VALUES ('r','d','reviewer','a','执行','已有审批理由',1)");
  db.exec(readFileSync(new URL('../drizzle/0003_bouncy_mach_iv.sql', import.meta.url), 'utf8'));
  const row = db.prepare('SELECT * FROM decisions WHERE id = ?').get('d');
  assert.equal(row.title, '问题');
  assert.equal(row.option_a_description, '');
  assert.equal(row.option_b_description, '');
  assert.equal(db.prepare('SELECT reason FROM reviews WHERE id = ?').get('r').reason, '已有审批理由');
  db.close();
});
