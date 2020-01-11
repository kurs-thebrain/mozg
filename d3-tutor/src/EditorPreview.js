import React, {useState, useEffect} from 'react'

import Preview from './Preview'
import Editor from './Editor'

const EditorPreview = (props) => {

    const [markdown, setMarkdown] = useState(() => {
        if (props.markdown)
            return props.markdown
        return '# Erorr'
    })
    const [isEditable, setIsEditable] = useState(true)

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
    return (
        <div>
            <Button/>
            {isEditable && <Editor markdown={markdown} useMarkdown={setMarkdown}/>}
            {!isEditable && <Preview markdown={markdown}/>}
        </div>
    )
}

export default EditorPreview