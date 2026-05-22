# Feature: Prontuário Digital Versionado

## O que a feature faz (Frontend Admin)
É o painel central de atendimento durante a consulta. Permite redigir o prontuário, preencher o odontograma, subir exames e puxar informações de uma consulta anterior.

## Telas a serem desenvolvidas
- **Página de Atendimento Clínico**: Formulário rico (rich text) para Avaliação, Procedimentos e Plano de Tratamento.
- **Ação "Duplicar de Consulta Anterior"**: Um botão lateral ou modal que lista os prontuários anteriores e permite copiar os dados do Prontuário #00X para o atual, facilitando o preenchimento sem afetar o histórico.
- **Upload de Anexos**: Área de "Drag and Drop" para inserir fotos ou raios-x durante a consulta.

## Endpoints consumidos
- `POST /api/medical-records`
- `POST /api/medical-records/{id}/duplicate`
- `POST /api/medical-records/{id}/attachments`
