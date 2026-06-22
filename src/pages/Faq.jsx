import Container from '../components/Container'
import PageHeader from '../components/PageHeader'
import PageSection from '../components/PageSection'
import Accordion from '../components/Accordion'
import ConsultationCta from '../components/ConsultationCta'
import { faqPageMeta, faqItems } from '../data/faq'

function Faq() {
  return (
    <>
      <PageHeader title={faqPageMeta.title} subtitle={faqPageMeta.subtitle} />

      <PageSection>
        <Container>
          <div className="mx-auto max-w-3xl">
            <Accordion items={faqItems} defaultOpenId={faqItems[0]?.id} />
          </div>
        </Container>
      </PageSection>

      <ConsultationCta />
    </>
  )
}

export default Faq
