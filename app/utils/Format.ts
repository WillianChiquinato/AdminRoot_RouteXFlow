//Remove tudo que não for número (Ideal para enviar para a API)
export const cleanNumber = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};

//Formata CPF: 000.000.000-00
export const formatCPF = (cpf: string): string => {
  let value = cleanNumber(cpf);
  if (value.length > 11) value = value.slice(0, 11);
  
  return value
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

//Formata Telefone Celular/Fixo: (00) 00000-0000 ou (00) 0000-0000
export const formatPhone = (phone: string): string => {
  let value = cleanNumber(phone);
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length === 11) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (value.length === 10) {
    return value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

//Formata Data para o padrão Brasileiro (DD/MM/YYYY)
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
};

//Formata Moeda
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};