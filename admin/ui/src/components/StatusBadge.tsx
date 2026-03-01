import type { Status } from '../../../shared/types';

const styles: Record<Status, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}
