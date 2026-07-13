import { PolicyResult } from './policyResult.js';

export class TicketPolicy {
  evaluate({ ticket, action, sameTypeCount = 0, maxSameType = 3, hasDocuments = false } = {}) {
    if (!ticket) {
      return PolicyResult.denied('ticket-not-provided');
    }

    if (action === 'edit' && ticket.status === 'closed') {
      return PolicyResult.denied('ticket-closed');
    }

    if (action === 'close' && ticket.status === 'closed') {
      return PolicyResult.denied('ticket-already-closed');
    }

    if (action === 'reopen' && ticket.status !== 'closed') {
      return PolicyResult.denied('ticket-not-closed');
    }

    if (action === 'create' && sameTypeCount >= maxSameType) {
      return PolicyResult.denied('duplicate-ticket-limit-reached');
    }

    if (action === 'upload-documents' && !hasDocuments) {
      return PolicyResult.allowed({ canUpload: true });
    }

    return PolicyResult.allowed({ action });
  }
}
