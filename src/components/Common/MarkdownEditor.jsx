import React, { useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

/**
 * ê³µí†µ ë§ˆí¬?¤ìš´ ?ë””??ì»´í¬?ŒíŠ¸ (react-md-editor ?˜í¼)
 *
 * Props:
 *   value        ???„ìž¬ ë§ˆí¬?¤ìš´ ë¬¸ìž?? *   onChange     ??(value: string) => void
 *   height       ???ë””???’ì´ (ê¸°ë³¸: 300)
 *   preview      ??'live' | 'edit' | 'preview' (ê¸°ë³¸: 'live')
 *   placeholder  ??placeholder ?ìŠ¤?? *   readOnly     ??true ?´ë©´ ë·°ì–´(preview) ëª¨ë“œë¡?ê³ ì •
 *   hideToolbar  ??true ?´ë©´ ?´ë°” ?¨ê?
 *   label        ???ë‹¨ ?¼ë²¨ ?ìŠ¤?? *   required     ???¼ë²¨ * ?œì‹œ
 *   id           ??input id (?¼ë²¨ htmlFor ?°ê²°)
 */
const MarkdownEditor = ({
    value = '',
    onChange,
    height = 300,
    preview = 'live',
    placeholder = '?´ìš©???…ë ¥?´ì£¼?¸ìš”.',
    readOnly = false,
    hideToolbar = false,
    label,
    required = false,
    id,
    ...rest
}) => {
    const handleChange = useCallback((val) => {
        if (onChange) onChange(val ?? '');
    }, [onChange]);

    return (
        <div className="markdown-editor-wrap" data-color-mode="light">
            {label && (
                <label
                    htmlFor={id}
                    className="form-label"
                    style={{ display: 'block', marginBottom: '4px' }}
                >
                    {label}
                    {required && <span className="text-danger ms-1">*</span>}
                </label>
            )}
            <MDEditor
                id={id}
                value={value}
                onChange={handleChange}
                height={height}
                preview={readOnly ? 'preview' : preview}
                hideToolbar={readOnly || hideToolbar}
                visibleDragbar={false}
                textareaProps={{ placeholder }}
                {...rest}
            />
        </div>
    );
};

export default MarkdownEditor;
