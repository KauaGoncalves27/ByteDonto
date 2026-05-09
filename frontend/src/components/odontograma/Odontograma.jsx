import { useState } from "react";

const STATUS = {
    "Higido":            { cor: "#22C55E", label: "Higido (Saudavel)" },
    "Carie":             { cor: "#EF4444", label: "Carie" },
    "Restaurado":        { cor: "#3B82F6", label: "Restaurado" },
    "Coroa":             { cor: "#F59E0B", label: "Coroa/Protese" },
    "Extracao Indicada": { cor: "#F97316", label: "Extracao Indicada" },
    "Ausente":           { cor: "#6B7280", label: "Ausente/Extraido" },
    "Implante":          { cor: "#8B5CF6", label: "Implante" },
    "Selante":           { cor: "#06B6D4", label: "Selante" },
};

// Mapeamento de keys internos para os labels originais com acentos
const STATUS_LABEL_MAP = {
    "Higido":            "Hígido",
    "Carie":             "Cárie",
    "Restaurado":        "Restaurado",
    "Coroa":             "Coroa",
    "Extracao Indicada": "Extração Indicada",
    "Ausente":           "Ausente",
    "Implante":          "Implante",
    "Selante":           "Selante",
};

// Converte a key armazenada (com acento) para a key interna (sem acento para CSS)
function normalizarStatus(s) {
    if (!s) return "Higido";
    const map = {
        "Hígido":            "Higido",
        "Higido":            "Higido",
        "Cárie":             "Carie",
        "Carie":             "Carie",
        "Restaurado":        "Restaurado",
        "Coroa":             "Coroa",
        "Extração Indicada": "Extracao Indicada",
        "Extracao Indicada": "Extracao Indicada",
        "Ausente":           "Ausente",
        "Implante":          "Implante",
        "Selante":           "Selante",
    };
    return map[s] || "Higido";
}

const ARCADA_SUPERIOR_DIREITA = [18, 17, 16, 15, 14, 13, 12, 11];
const ARCADA_SUPERIOR_ESQUERDA = [21, 22, 23, 24, 25, 26, 27, 28];
const ARCADA_INFERIOR_ESQUERDA = [31, 32, 33, 34, 35, 36, 37, 38];
const ARCADA_INFERIOR_DIREITA  = [41, 42, 43, 44, 45, 46, 47, 48];

function Dente({ numero, statusKey, onClick, readOnly }) {
    const corFundo = STATUS[statusKey]?.cor || "#F3F4F6";
    const isHigido = statusKey === "Higido" || !statusKey;

    return (
        <div
            onClick={() => !readOnly && onClick(numero)}
            title={`Dente ${numero} — ${STATUS[statusKey]?.label || "Higido (Saudavel)"}`}
            style={{
                width: "44px",
                height: "44px",
                borderRadius: "8px",
                background: isHigido ? "#F3F4F6" : corFundo,
                border: `2px solid ${isHigido ? "var(--LineColor, #E5E7EB)" : corFundo}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: readOnly ? "default" : "pointer",
                transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: isHigido ? "none" : "0 2px 6px rgba(0,0,0,0.15)",
                flexShrink: 0,
                position: "relative",
            }}
            onMouseEnter={e => { if (!readOnly) { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = isHigido ? "none" : "0 2px 6px rgba(0,0,0,0.15)"; }}
        >
            <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: isHigido ? "var(--TextColor75, #6B7280)" : "white",
                lineHeight: 1,
            }}>
                {numero}
            </span>
        </div>
    );
}

function PainelEdicao({ numero, statusAtual, obsAtual, onSalvar, onFechar }) {
    const [statusSelecionado, setStatusSelecionado] = useState(statusAtual || "Higido");
    const [obs, setObs] = useState(obsAtual || "");

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }}
            onClick={e => { if (e.target === e.currentTarget) onFechar(); }}
        >
            <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "1.5rem",
                width: "320px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, color: "var(--TextColor, #111827)", fontSize: "18px" }}>
                        Dente {numero}
                    </h3>
                    <button
                        onClick={onFechar}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--TextColor75, #6B7280)", lineHeight: 1 }}
                    >
                        ×
                    </button>
                </div>

                <div>
                    <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "13px", color: "var(--TextColor75, #6B7280)" }}>Status</p>
                    <select
                        value={statusSelecionado}
                        onChange={e => setStatusSelecionado(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--LineColor, #E5E7EB)",
                            fontSize: "14px",
                            color: "var(--TextColor, #111827)",
                            background: "white",
                            cursor: "pointer",
                        }}
                    >
                        {Object.keys(STATUS).map(key => (
                            <option key={key} value={key}>
                                {STATUS[key].label}
                            </option>
                        ))}
                    </select>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                    }}>
                        <div style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "4px",
                            background: STATUS[statusSelecionado]?.cor || "#F3F4F6",
                            flexShrink: 0,
                        }} />
                        <span style={{ fontSize: "12px", color: "var(--TextColor75, #6B7280)" }}>
                            {STATUS[statusSelecionado]?.label}
                        </span>
                    </div>
                </div>

                <div>
                    <p style={{ margin: "0 0 6px 0", fontWeight: 700, fontSize: "13px", color: "var(--TextColor75, #6B7280)" }}>Observacao</p>
                    <textarea
                        value={obs}
                        onChange={e => setObs(e.target.value)}
                        rows={3}
                        placeholder="Anotacoes clinicas sobre este dente..."
                        style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "8px",
                            border: "1px solid var(--LineColor, #E5E7EB)",
                            fontSize: "14px",
                            resize: "vertical",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        onClick={() => onSalvar(numero, statusSelecionado, obs)}
                        style={{
                            flex: 1,
                            padding: "10px",
                            background: "var(--PrimaryColorsTheme, #2563EB)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Salvar
                    </button>
                    <button
                        onClick={onFechar}
                        style={{
                            padding: "10px 16px",
                            background: "transparent",
                            color: "var(--TextColor75, #6B7280)",
                            border: "1px solid var(--LineColor, #E5E7EB)",
                            borderRadius: "8px",
                            fontWeight: 600,
                            fontSize: "14px",
                            cursor: "pointer",
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}

function Arcada({ quadranteEsq, quadranteDireito, dados, onClickDente, readOnly, label }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--TextColor75, #6B7280)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {label}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                <div style={{ display: "flex", gap: "4px", paddingRight: "8px", borderRight: "2px solid var(--LineColor, #E5E7EB)" }}>
                    {quadranteEsq.map(num => {
                        const dente = dados[String(num)] || {};
                        return (
                            <Dente
                                key={num}
                                numero={num}
                                statusKey={normalizarStatus(dente.status)}
                                onClick={onClickDente}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </div>
                <div style={{ display: "flex", gap: "4px", paddingLeft: "8px" }}>
                    {quadranteDireito.map(num => {
                        const dente = dados[String(num)] || {};
                        return (
                            <Dente
                                key={num}
                                numero={num}
                                statusKey={normalizarStatus(dente.status)}
                                onClick={onClickDente}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function Odontograma({ dados = {}, onChange, readOnly = false }) {
    const [denteSelecionado, setDenteSelecionado] = useState(null);

    function handleClickDente(numero) {
        setDenteSelecionado(numero);
    }

    function handleSalvar(numero, statusKey, obs) {
        const novosDados = {
            ...dados,
            [String(numero)]: {
                status: STATUS_LABEL_MAP[statusKey] || statusKey,
                obs,
            },
        };
        onChange && onChange(novosDados);
        setDenteSelecionado(null);
    }

    const denteAtual = denteSelecionado !== null ? (dados[String(denteSelecionado)] || {}) : {};

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {!readOnly && (
                <p style={{ margin: 0, fontSize: "13px", color: "var(--TextColor75, #6B7280)" }}>
                    Clique em um dente para alterar seu status. Clique em "Salvar Odontograma" ao terminar.
                </p>
            )}

            <div style={{
                background: "white",
                borderRadius: "16px",
                border: "1px solid var(--LineColor, #E5E7EB)",
                padding: "1.5rem 1rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                overflowX: "auto",
            }}>
                <Arcada
                    label="Superior"
                    quadranteEsq={ARCADA_SUPERIOR_DIREITA}
                    quadranteDireito={ARCADA_SUPERIOR_ESQUERDA}
                    dados={dados}
                    onClickDente={handleClickDente}
                    readOnly={readOnly}
                />

                <div style={{ width: "100%", maxWidth: "420px", height: "2px", background: "var(--LineColor, #E5E7EB)", borderRadius: "1px", margin: "6px 0" }} />

                <div style={{ fontSize: "10px", color: "var(--TextColor75, #6B7280)", fontWeight: 600 }}>
                    Linha Horizontal (Oclusal)
                </div>

                <div style={{ width: "100%", maxWidth: "420px", height: "2px", background: "var(--LineColor, #E5E7EB)", borderRadius: "1px", margin: "6px 0" }} />

                <Arcada
                    label="Inferior"
                    quadranteEsq={ARCADA_INFERIOR_ESQUERDA}
                    quadranteDireito={ARCADA_INFERIOR_DIREITA}
                    dados={dados}
                    onClickDente={handleClickDente}
                    readOnly={readOnly}
                />
            </div>

            {/* LEGENDA */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
            }}>
                {Object.entries(STATUS).map(([key, { cor, label }]) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid var(--LineColor, #E5E7EB)", borderRadius: "8px", padding: "4px 10px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: cor, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "var(--TextColor75, #6B7280)", whiteSpace: "nowrap" }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* PAINEL DE EDICAO */}
            {denteSelecionado !== null && (
                <PainelEdicao
                    numero={denteSelecionado}
                    statusAtual={normalizarStatus(denteAtual.status)}
                    obsAtual={denteAtual.obs || ""}
                    onSalvar={handleSalvar}
                    onFechar={() => setDenteSelecionado(null)}
                />
            )}
        </div>
    );
}
