/*
 * Constitution / entity types. Used by the client form's Type field, the
 * Items grid's TY column and the Clients list filter. Values are stable ids
 * stored on clients, so existing ones are kept when a label changes.
 */
export const CLIENT_TYPES = [
  { value: 'individual', label: 'Individual' },
  { value: 'proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership Firm' },
  { value: 'llp', label: 'LLP' },
  { value: 'huf', label: 'HUF' },
  { value: 'private-limited', label: 'Private Limited' },
  { value: 'public-limited', label: 'Limited Company' },
  { value: 'joint-venture', label: 'Joint-Venture Company' },
  { value: 'opc', label: 'One Person Company' },
  { value: 'ngo', label: 'NGO' },
  { value: 'trust', label: 'Trust' },
  { value: 'section-8', label: 'Section 8 Company' },
  { value: 'government', label: 'Government Entity' },
  { value: 'co-operative-society', label: 'Co-operative Society' },
  { value: 'branch-office', label: 'Branch Office' },
  { value: 'aop', label: 'AOP' },
  { value: 'society', label: 'Society' },
  { value: 'ajp', label: 'Artificial Juridical Person' },
  { value: 'boi', label: 'Body of Individual' },
  { value: 'local-authority', label: 'Local Authority' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'others', label: 'Other' },
];
