import {PortableText} from '@portabletext/react'

const components = {
  block: {
    h1: ({children, value}) => (
      <h1 id={value?._key} className="text-4xl font-bold my-6">
        {children}
      </h1>
    ),
    h2: ({children, value}) => (
      <h2 id={value?._key} className="text-3xl font-bold my-5">
        {children}
      </h2>
    ),
    h3: ({children, value}) => (
      <h3 id={value?._key} className="text-2xl font-semibold my-4">
        {children}
      </h3>
    ),
    h4: ({children, value}) => (
      <h4 id={value?._key} className="text-xl font-semibold my-3">
        {children}
      </h4>
    ),
    normal: ({children}) => <p className="my-4 leading-relaxed">{children}</p>,
    blockquote: ({children}) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
        {children}
      </blockquote>
    )
  },
  list: {
    bullet: ({children}) => <ul className="list-disc ml-6 my-4">{children}</ul>,
    number: ({children}) => <ol className="list-decimal ml-6 my-4">{children}</ol>
  },
  listItem: {
    bullet: ({children}) => <li className="my-2">{children}</li>,
    number: ({children}) => <li className="my-2">{children}</li>
  },
  marks: {
    strong: ({children}) => <strong className="font-bold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    link: ({value, children}) => (
      <a
        href={value?.href}
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="text-primary underline hover:text-primary-dark"
      >
        {children}
      </a>
    )
  }
}

const PortableTextRenderer = ({content}) => {
  if (!content) return null
  return <PortableText value={content} components={components} />
}

export default PortableTextRenderer
