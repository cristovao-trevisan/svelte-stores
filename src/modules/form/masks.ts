
export function maskCPF(cpf: string) {
  cpf = cpf.replace(/\D/g,'').slice(0, 11);                    // get digits only
  cpf = cpf.replace(/(\d{3})(\d)/,'$1.$2');       // first dot
  cpf = cpf.replace(/(\d{3})(\d)/,'$1.$2');       // second dot
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/,'$1-$2'); // slash
  return cpf;
}
