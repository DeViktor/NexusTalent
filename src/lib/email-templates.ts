export interface EmailTemplate {
    id: string;
    name: string;
    html: string;
    imageCount: 0 | 1 | 2;
}

const templateMinimalist: EmailTemplate = {
    id: 'minimalist',
    name: 'Minimalista',
    imageCount: 0,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; }
  .header { padding: 20px; text-align: center; }
  .content { padding: 20px; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
  .button { background-color: #1d71b8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
</style>
</head>
<body>
  <div class="header"><img src="[LOGO_URL]" alt="Logo" width="150"></div>
  <div class="content">
    <h1>Assunto do E-mail</h1>
    <p>Corpo do e-mail aqui...</p>
    <p><a href="[BUTTON_LINK]" class="button">Texto do Botão</a></p>
  </div>
  <div class="footer">
    <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
    <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
  </div>
</body>
</html>
`
};

const templateNewsletter: EmailTemplate = {
    id: 'newsletter',
    name: 'Newsletter',
    imageCount: 1,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: auto; background-color: white; }
  .header { padding: 20px; text-align: center; background-color: #f8f9fa; }
  .hero-image { width: 100%; height: auto; }
  .content { padding: 30px; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
  .button { display: inline-block; background-color: #1d71b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="[LOGO_URL]" alt="Logo" width="150"></div>
    <div><img src="[IMAGE_URL_1]" alt="Header Image" class="hero-image"></div>
    <div class="content">
      <h1>Assunto Principal</h1>
      <p>Este é o parágrafo principal da sua newsletter. Fale sobre as novidades, promoções ou o que for mais importante.</p>
      <p>Pode adicionar mais detalhes e informações relevantes aqui para envolver o seu leitor.</p>
      <p style="text-align: center; margin-top: 30px;"><a href="[BUTTON_LINK]" class="button">Texto do Botão</a></p>
    </div>
    <div class="footer">
      <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};

const templateSimpleAlert: EmailTemplate = {
    id: 'simple_alert',
    name: 'Alerta Simples',
    imageCount: 0,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f1f5f9; }
  .container { max-width: 600px; margin: 20px auto; background-color: white; border: 1px solid #e2e8f0; border-radius: 8px;}
  .header { padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0; }
  .content { padding: 30px 20px; text-align: center;}
  .content h1 { font-size: 24px; margin: 0 0 10px 0; }
  .content p { color: #475569; line-height: 1.6; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  .button { display: inline-block; background-color: #1d71b8; color: white !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="[LOGO_URL]" alt="Logo" width="120"></div>
    <div class="content">
      <h1>Assunto Principal</h1>
      <p>Este é o parágrafo principal do seu e-mail. Ideal para mensagens diretas e importantes, como um alerta de vaga ou uma notificação.</p>
      <a href="[BUTTON_LINK]" class="button">Texto do Botão</a>
    </div>
    <div class="footer">
      <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]" style="color: #94a3b8;">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};

const templateEventInvitation: EmailTemplate = {
    id: 'event_invitation',
    name: 'Convite para Evento',
    imageCount: 1,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f0f0f0; }
  .container { max-width: 600px; margin: auto; background-color: white; }
  .header { padding: 20px; text-align: center; }
  .banner { width: 100%; height: auto; }
  .content { padding: 20px 30px; }
  .event-details { background-color: #f8f8f8; border-left: 4px solid #1d71b8; padding: 15px; margin: 20px 0; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
  .button { display: inline-block; background-color: #ff8c00; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="[LOGO_URL]" alt="Logo" width="150"></div>
    <div><img src="[IMAGE_URL_1]" alt="Event Banner" class="banner"></div>
    <div class="content">
      <h1>Você está convidado!</h1>
      <p>Junte-se a nós para um evento especial onde vamos explorar as últimas tendências do mercado.</p>
      <div class="event-details">
        <p><strong>QUANDO:</strong> 25 de Dezembro, 2024 às 18:00</p>
        <p><strong>ONDE:</strong> Online (Link será enviado após inscrição)</p>
      </div>
      <p style="text-align: center; margin-top: 30px;"><a href="[BUTTON_LINK]" class="button">Confirmar Presença</a></p>
    </div>
    <div class="footer">
      <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};

const templateFeatureAnnouncement: EmailTemplate = {
    id: 'feature_announcement',
    name: 'Anúncio de Destaque',
    imageCount: 1,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
  .container { max-width: 600px; margin: auto; background-color: #f9f9f9; }
  .header { padding: 20px; text-align: center; }
  .content { padding: 20px 30px; }
  .feature-box { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; align-items: center; margin: 20px 0;}
  .feature-icon img { width: 100%; max-width: 150px; height: auto; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
  .button { display: inline-block; background-color: #1d71b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="[LOGO_URL]" alt="Logo" width="150"></div>
    <div class="content">
      <h1>Grande Novidade na Nossa Plataforma!</h1>
      <p>Temos o prazer de anunciar uma nova funcionalidade que irá revolucionar a sua experiência.</p>
      <div class="feature-box">
        <div class="feature-icon"><img src="[IMAGE_URL_1]" alt="Feature Icon"></div>
        <div>
          <h2>Título da Funcionalidade</h2>
          <p>Descrição detalhada do que a nova funcionalidade faz e como beneficia o utilizador.</p>
        </div>
      </div>
      <p style="text-align: center; margin-top: 30px;"><a href="[BUTTON_LINK]" class="button">Explore a Novidade</a></p>
    </div>
    <div class="footer">
      <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};

const templatePersonalNote: EmailTemplate = {
    id: 'personal_note',
    name: 'Nota Pessoal',
    imageCount: 0,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #ffffff; }
  .container { max-width: 600px; margin: auto; background-color: white; padding: 20px; }
  .content { line-height: 1.7; }
  .signature { margin-top: 30px; }
  .footer { border-top: 1px solid #eee; margin-top: 30px; padding-top: 15px; font-size: 12px; color: #888; }
</style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Olá [NOME_DO_CLIENTE],</p>
      <p>Escrevo para partilhar algo que penso ser do seu interesse. O nosso objetivo é sempre ajudá-lo a atingir os seus objetivos, e por isso...</p>
      <p>O corpo principal do e-mail vai aqui, com um tom mais pessoal e direto.</p>
      <div class="signature">
        <p>Com os melhores cumprimentos,</p>
        <p><strong>[NOME_DO_REMETENTE]</strong><br>[CARGO_DO_REMETENTE]<br>[COMPANY_NAME]</p>
      </div>
    </div>
    <div class="footer">
      <p>Enviado de [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};

const templateTwoColumnPromo: EmailTemplate = {
    id: 'two_column_promo',
    name: 'Promoção Dupla',
    imageCount: 2,
    html: `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
  .container { max-width: 600px; margin: auto; background-color: white; }
  .header { padding: 20px; text-align: center; }
  .content { padding: 20px; }
  .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .column img { width: 100%; height: auto; border-radius: 4px; }
  .column h3 { font-size: 16px; margin: 10px 0; }
  .column p { font-size: 14px; margin: 0 0 10px 0; }
  .button { display: inline-block; font-size: 13px; background-color: #1d71b8; color: white; padding: 8px 15px; text-decoration: none; border-radius: 5px; }
  .footer { padding: 20px; text-align: center; font-size: 12px; color: #888; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><img src="[LOGO_URL]" alt="Logo" width="150"></div>
    <div class="content">
      <h1>Destaques da Semana</h1>
      <p>Não perca estas oportunidades exclusivas que selecionámos para si.</p>
      <div class="two-columns">
        <div class="column">
          <img src="[IMAGE_URL_1]" alt="Promo 1">
          <h3>Título do Primeiro Destaque</h3>
          <p>Breve descrição sobre o primeiro item em promoção.</p>
          <a href="[BUTTON_LINK_1]" class="button">Saber Mais</a>
        </div>
        <div class="column">
          <img src="[IMAGE_URL_2]" alt="Promo 2">
          <h3>Título do Segundo Destaque</h3>
          <p>Breve descrição sobre o segundo item em promoção.</p>
          <a href="[BUTTON_LINK_2]" class="button">Saber Mais</a>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>[COMPANY_NAME] | [COMPANY_ADDRESS]</p>
      <p><a href="[UNSUBSCRIBE_LINK]">Cancelar Subscrição</a></p>
    </div>
  </div>
</body>
</html>
`
};


const allTemplates: EmailTemplate[] = [
    templateNewsletter,
    templateTwoColumnPromo,
    templateSimpleAlert, 
    templateMinimalist,
    templateEventInvitation,
    templateFeatureAnnouncement,
    templatePersonalNote,
];

export const getTemplates = (): EmailTemplate[] => {
    return allTemplates;
}

export const getTemplateHtmlById = (id: string): string | null => {
    return allTemplates.find(t => t.id === id)?.html || null;
}
