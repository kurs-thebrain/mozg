import React from 'react'
//import Markdown from 'markdown-to-jsx'
import ReactMarkdown from 'react-markdown'

const Viewer = (props) => {
    return <ReactMarkdown>{props.markdown}</ReactMarkdown>
}

export default Viewer