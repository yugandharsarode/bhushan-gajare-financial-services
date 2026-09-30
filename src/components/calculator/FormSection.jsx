import FieldGroupHeading from './FieldGroupHeading'

const GRID_COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
}

/**
 * A titled group of inputs laid out in a responsive grid inside the
 * calculator input panel.
 */
function FormSection({ title, note, columns = 4, children }) {
  return (
    <section className="flex flex-col gap-4">
      {title && <FieldGroupHeading note={note}>{title}</FieldGroupHeading>}
      <div className={`grid items-start gap-x-6 gap-y-6 ${GRID_COLUMNS[columns] || GRID_COLUMNS[4]}`}>
        {children}
      </div>
    </section>
  )
}

export default FormSection
