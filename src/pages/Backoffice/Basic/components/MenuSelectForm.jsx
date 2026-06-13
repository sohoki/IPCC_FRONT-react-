
import React from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';


const MenuSelectForm = ({   
    open,
    menuGubun,
    treeData,
    checkedKeys,
    onChangeCheckedKeys,
    detailedRows,           // [{menuNo, menuNm, S,I,E,D,X}]
    onChangeDetailedCell,   // (menuNo, field, value)
    onClose,
    onSave, }) => {

    if (!open) return null;
    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: '80%', maxWidth: 1000, backgroundColor :"#fff" }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">Î©îÎâ¥ ?§Ï†ï</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body tab-content">
                            <div className="modal-body__content tab-pane show active">
                                {menuGubun === 'MENU_GUBUN_1' ? (
                                <div style={{ maxHeight: 600, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
                                    <Tree
                                    treeData={treeData}
                                    checkable
                                    defaultExpandAll
                                    checkedKeys={checkedKeys}
                                    onCheck={(keys) => onChangeCheckedKeys(keys)}
                                    />
                                    <div className="text-muted mt-2">Ï≤¥ÌÅ¨??Î©îÎâ¥ + ?ÅÏúÑ Î©îÎâ¥???úÎ≤Ñ?êÏÑú ?êÎèô ?¨Ìï®?òÎèÑÎ°?Ï≤òÎ¶¨?òÏÑ∏??</div>
                                </div>
                                ) : (
                                <div style={{ maxHeight: 600, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
                                    <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                        <th>Î©îÎâ¥Î™?/th>
                                        <th style={{ width: 70 }}>Ï°∞Ìöå</th>
                                        <th style={{ width: 70 }}>?ÖÎ†•</th>
                                        <th style={{ width: 70 }}>?òÏ†ï</th>
                                        <th style={{ width: 70 }}>??†ú</th>
                                        <th style={{ width: 100 }}>Excel</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detailedRows.map((r) => (
                                        <tr key={r.menuNo}>
                                            <td>{r.menuNm}</td>
                                            {['S','I','E','D','X'].map((f) => (
                                            <td key={f}>
                                                <input
                                                type="checkbox"
                                                checked={r[f] === '1'}
                                                onChange={(e) => onChangeDetailedCell(r.menuNo, f, e.target.checked ? '1' : '0')}
                                                />
                                            </td>
                                            ))}
                                        </tr>
                                        ))}
                                        {detailedRows.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted py-3">?∞Ïù¥?∞Í? ?ÜÏäµ?àÎã§.</td>
                                        </tr>
                                        )}
                                    </tbody>
                                    </table>
                                </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>Ï∑®ÏÜå</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSave}>?Ä??/button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MenuSelectForm;
