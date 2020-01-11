import React from 'react'

const Editor = (props) => {

    const onChange = (e) => {
        props.useMarkdown(e.target.value)
    }

    const handleSubmit = (e) => {

    }

    return (
        <div>
            <textarea id="editor" value={props.markdown} onChange={onChange}/>
        </div>
    )
}

export default Editor