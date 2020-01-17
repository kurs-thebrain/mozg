import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import {Editor, EditorState,RichUtils} from 'md-draft-js'
import LinkIcon from '@material-ui/icons/Link'
import ImageIcon from '@material-ui/icons/Image'

const commands = [
    {
        command: 'bold',
        icon: 'bold',
        label: 'Bold'
    },
    {
        command: 'italic',
        icon: 'italic',
        label: 'Italic'
    },
    {
        command: 'heading',
        icon: 'heading',
        label: 'Heading'
    },
    {
        command: 'quote',
        icon: 'quote-right',
        label: 'Quote'
    },
    {
        command: 'code',
        icon: 'code',
        label: 'Monospace'
    },
    {
        command: 'ul',
        icon: 'list-ul',
        label: 'List'
    },
    {
        command: 'ol',
        icon: 'list-ol',
        label: 'Numbered'
    }
];

const MdEditor = (props) => {
    const [state, setState] = useState({
        editorState: EditorState.createWithContent(props.markdown)
    })

    

    var onChange = (editorState) => {setState({editorState}); props.useMarkdown(state.editorState.text)}

    var handleKeyCommand = ({ key }) => {
        const newState = RichUtils.applyCommand(state.editorState, key)
        if (newState) onChange(newState)
    }

    var onClickCommand = command => {
        onChange(RichUtils.applyCommand(state.editorState, command))
    }

    var onLinkClick = () => {
        const link = global.prompt('Link URL:')
        if (link) onChange( RichUtils.applyCommand(state.editorState, 'link', link))
    }

    var onImageClick = () => {
        const image = global.prompt('Image URL:')
        if (image) onChange(RichUtils.applyCommand(state.editorState, 'media', image))
    }

    return (
        <div className="editor">
            <div className="editor-buttons">
                {commands.map(({command,label,icon},key)=>(
                    <button
                        key={key}
                        className={classNames(
                            'editor-action',
                            state.editorState.getCurrentInlineStyle().has(command)
                              ? 'active'
                              : ''
                        )}
                        onClick={onClickCommand.bind(this, command)}
                        aria-label="Bold"
                    >
                        <i
                            key={`span-${key}`}
                            className={`fas fa-${icon || command}`}
                            aria-hidden="true"
                        />
                    </button>
                ))}
                <button
                    className="editor-action"
                    onClick={onLinkClick.bind(this)}
                    aria-label="Link"
                >
                    <LinkIcon color="inherit" fontSize="inherit"/>
                </button>
                <button
                    className="editor-action"
                    onClick={onImageClick.bind(this)}
                    aria-label="Image"
                >
                    <ImageIcon color="inherit" fontSize="inherit"/>
                </button>
            </div>
            <Editor
                autoFocus
                className="editor-textarea"
                editorState={state.editorState}
                onKeyCommand={handleKeyCommand}
                onChange={onChange}
            />
        </div>
    )
}

export default MdEditor