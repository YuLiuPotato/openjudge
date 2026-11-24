'use client';
import { Check, ChevronDown } from 'lucide-react';
import { Select } from 'radix-ui';
import { categories } from './shared';

type Props = { value: string; onChange: (value: string) => void; label: string; id?: string; includeAll?: boolean; variant?: 'filter' | 'form' };
export function TopicSelect({ value, onChange, label, id, includeAll = false, variant = 'filter' }: Props) {
  const options = includeAll ? categories : categories.slice(1);
  return <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger id={id} aria-label={label} className={`topic-trigger topic-trigger-${variant}`}><Select.Value /><Select.Icon asChild><ChevronDown size={16} aria-hidden="true" /></Select.Icon></Select.Trigger>
    <Select.Portal><Select.Content data-openjudge-select-content className="topic-menu" position="popper" sideOffset={6} align={variant === 'filter' ? 'end' : 'start'}><Select.Viewport className="topic-menu-viewport"><Select.Group>{options.map(option => <Select.Item key={option} value={option} className="topic-option"><Select.ItemText>{option === '全部' ? '全部话题' : option}</Select.ItemText><Select.ItemIndicator className="topic-indicator"><Check size={15} aria-hidden="true" /></Select.ItemIndicator></Select.Item>)}</Select.Group></Select.Viewport></Select.Content></Select.Portal>
  </Select.Root>;
}
