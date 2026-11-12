import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidade · Catálogo CSM',
  description: 'Política de privacidade da CSM Decor.',
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-2xl space-y-4" style={{ color: 'var(--f)' }}>
      <h1 className="_fd" style={{ fontSize: '2rem', fontWeight: 400 }}>Privacidade</h1>
      <p style={{ color: 'var(--g)' }}>
        Esta página é um placeholder e será atualizada com a política de privacidade
        completa da CSM Decor.
      </p>
      <p style={{ color: 'var(--g)' }}>
        Ao enviar sua seleção de produtos, você autoriza a CSM Decor a utilizar o nome
        e o telefone informados exclusivamente para entrar em contato sobre os produtos
        selecionados. Não compartilhamos seus dados com terceiros para fins de marketing.
      </p>
      <p style={{ color: 'var(--g)' }}>
        Para dúvidas ou para solicitar a remoção dos seus dados, entre em contato com a
        equipe da CSM Decor.
      </p>
    </div>
  )
}
