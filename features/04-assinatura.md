# Feature: Assinatura Eletrônica e Física

## O que a feature faz (Frontend Admin)
Oferece ao dentista os meios para coletar a concordância do paciente em relação ao prontuário recém-criado.

## Telas a serem desenvolvidas
- **Modal de Conclusão do Prontuário**: Ao salvar um prontuário, o sistema pergunta o tipo de assinatura:
    - **Opção Física**: Exibe um componente de upload (input type="file" capturando direto da câmera do celular/tablet do dentista ou arquivo).
    - **Opção Eletrônica**: Exibe um QR Code na tela (para o paciente apontar o celular) ou um botão "Copiar Link" para mandar pro WhatsApp do paciente no consultório.

## Endpoints consumidos
- `POST /api/signatures/physical`
- `POST /api/signatures/electronic/generate-link`
