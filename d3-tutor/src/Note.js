import React, { Component, useState } from 'react'
import ReactDOM from 'react-dom'
import ReactMarkdown from 'react-markdown'

import Typography from '@material-ui/core/Typography'

class TextAr extends Component {
    constructor (props) {
        super(props)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, false);
    }
      
    componentWillMount() {
        document.addEventListener('click', this.handleClickOutside, false);
    }
      
    handleClickOutside = (event) => {
        const domNode = ReactDOM.findDOMNode(this);
      
        if ((!domNode || !domNode.contains(event.target))) {
            this.props.setHide()
        }
    }

    render() {
        return (
            <textarea
                onresize="true"
                className="note-textarea"
                value={this.props.value}
                onChange={(e) => this.props.setMarkdown(e.target.value)}
            />
        )
    }

}

const Note = (props) => {
    const [markdown, setMarkdown] = useState(() => {
        if (props.markdown)
            return props.markdown
        return '# Erorr'
    })
    const [isEditable, setIsEditable] = useState(() => {
        if (props.markdown)
            return true
        return false
    })

    const Text = isEditable ?
        <Typography onClick={() => setIsEditable(false)}>
            <ReactMarkdown>
                {markdown}
            </ReactMarkdown>
        </Typography>:
        <TextAr
            value={markdown}
            setMarkdown={setMarkdown}
            setHide={()=> setIsEditable(true)}
        />

    return (
        <div>
            <div className="note-hat">
                <Typography variant="h4">{props.label}</Typography>
            </div>
            <div>
                {Text}
            </div>
        </div>
    )
}

export default Note