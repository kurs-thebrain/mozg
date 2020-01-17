import React, {useState, useEffect} from 'react'

import Note from './Note'

import Preview from './Preview'
import MdEditor from './Editor'

const EditorPreview = (props) => {

    const [markdown, setMarkdown] = useState(() => {
        if (props.markdown)
            return props.markdown
        return '# Erorr'
    })
    const [isEditable, setIsEditable] = useState(false)

    const Button = () => {
        const render = isEditable ? 
        <button 
            onClick={() => setIsEditable(!isEditable)}>
                Preview
        </button> : 
        <button 
            onClick={() => setIsEditable(!isEditable)}>
                Edit
        </button>

        return render
    }

    console.log('render')
    /*return (
        <div>
            <div className = "editor-buttons">
                <Button/>
            </div>
            {isEditable && <MdEditor markdown={markdown} setMarkdown={setMarkdown}/>}
            {!isEditable && <Preview markdown={markdown}/>}
        </div>
    )*/
    return <Note markdown={markdown} setMarkdown={setMarkdown}/>
}

export default EditorPreview