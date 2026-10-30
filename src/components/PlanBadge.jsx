import { Plan } from '../domain/Plan';

export function PlanBadge({ planCode }) {
  const plan = Plan.of(planCode);
  return <span className={`badge badge--${plan.code.toLowerCase()}`}>{plan.label}</span>;
}
