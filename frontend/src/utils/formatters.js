// Exibição — recebe valor bruto do banco, retorna string formatada

export function formatCPF(v) {
    if (!v) return "—";
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length === 11) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    return v;
}

export function formatPhone(v) {
    if (!v) return "—";
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return v;
}

export function formatDate(v) {
    if (!v) return "—";
    try {
        // "2024-01-15" → "15/01/2024" sem converter timezone
        const [year, month, day] = String(v).split("T")[0].split("-");
        if (year && month && day) return `${day}/${month}/${year}`;
        return new Date(v).toLocaleDateString("pt-BR");
    } catch {
        return v;
    }
}

export function formatCurrency(v) {
    return Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function calcIdade(dataString) {
    if (!dataString) return "";
    const [year, month, day] = String(dataString).split("T")[0].split("-");
    const nascimento = new Date(Number(year), Number(month) - 1, Number(day));
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
    return idade;
}

// Máscaras de input — usadas em onChange para formatar enquanto o usuário digita

export function maskCPF(v) {
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length <= 3)  return d;
    if (d.length <= 6)  return `${d.slice(0,3)}.${d.slice(3)}`;
    if (d.length <= 9)  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

export function maskPhone(v) {
    const d = String(v).replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2)  return d.length ? `(${d}` : "";
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    return v;
}

export function maskCEP(v) {
    const d = String(v).replace(/\D/g, "").slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0,5)}-${d.slice(5)}`;
}

export function maskRG(v) {
    return String(v).replace(/\D/g, "").slice(0, 9);
}
