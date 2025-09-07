export function maskCEP(v: string): string {
  return v.replace(/\D/g,'').slice(0,8).replace(/(\d{5})(\d)/,'$1-$2');
}

export function maskCPF(v: string): string {
  return v.replace(/\D/g,'').slice(0,11)
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
}

export function maskCNPJ(v: string): string {
  return v.replace(/\D/g,'').slice(0,14)
    .replace(/(\d{2})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1/$2')
    .replace(/(\d{4})(\d{1,2})$/,'$1-$2');
}

export function maskTaxId(v: string): string {
  return v.replace(/\D/g,'').length <= 11 ? maskCPF(v) : maskCNPJ(v);
}

export function maskPhone(v: string): string {
  const digits = v.replace(/\D/g,'');
  if (digits.length <= 10) {
    // Telefone fixo: (11) 1234-5678
    return digits.slice(0,10).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2');
  } else {
    // Celular: (11) 91234-5678
    return digits.slice(0,11).replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2');
  }
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g,'');
  return digits.length >= 10 && digits.length <= 11;
}

export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g,'');
  if (cpf.length !== 11 || /(\d)\1{10}/.test(cpf)) return false;
  let soma = 0;
  for (let i=0;i<9;i++) soma += parseInt(cpf[i])*(10-i);
  let d1 = (soma*10)%11; if(d1===10) d1=0; if(d1!==parseInt(cpf[9])) return false;
  soma = 0;
  for (let i=0;i<10;i++) soma += parseInt(cpf[i])*(11-i);
  let d2 = (soma*10)%11; if(d2===10) d2=0; return d2===parseInt(cpf[10]);
}

export function isValidCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g,'');
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;
  const calc = (len: number) => {
    let nums = cnpj.substring(0,len);
    let sum = 0; let pos = len - 7;
    for (let i=len; i>=1; i--) { sum += parseInt(nums[len - i]) * pos--; if (pos < 2) pos = 9; }
    let res = sum % 11; return res < 2 ? 0 : 11 - res;
  };
  const d1 = calc(12); const d2 = calc(13); return d1 === parseInt(cnpj[12]) && d2 === parseInt(cnpj[13]);
}

export function validTax(taxId: string): boolean {
  const digits = taxId.replace(/\D/g,'');
  return digits.length<=11 ? isValidCPF(taxId) : isValidCNPJ(taxId);
}
