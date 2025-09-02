# Annexes

## SoftDelete (Doctrine + Gedmo)
```yaml
# config/packages/doctrine.yaml
filters:
  softdeleteable:
    class: Gedmo\SoftDeleteable\Filter\SoftDeleteableFilter
    enabled: true
```

## Mapping des phases (TypeScript)
```ts
const phaseMapping = {
  submitted: 1, under_review: 1,
  awaiting_documents: 2, documents_pending: 2, documents_rejected: 2, awaiting_prerequisites: 2,
  awaiting_funding: 3, funding_approved: 3, awaiting_payment: 3, payment_pending: 3,
  confirmed: 4, awaiting_start: 4,
  in_progress: 5, attendance_issues: 5, suspended: 5,
  completed: 6, failed: 6, cancelled: 6, refunded: 6
};
// Progress (%) = ((currentPhase - 1) / 5) * 100
```