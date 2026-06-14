
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
                                <h2 className="modal-title__title">메뉴 설정</h2>
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
                                    <div className="text-muted mt-2">체크된 메뉴 + 위 메뉴를 선택하여 동일하게 처리합니다.</div>
                                </div>
                                ) : (
                                <div style={{ maxHeight: 600, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
                                    <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                        <th>메뉴선택</th>
                                        <th style={{ width: 70 }}>조회</th>
                                        <th style={{ width: 70 }}>입력</th>
                                        <th style={{ width: 70 }}>수정</th>
                                        <th style={{ width: 70 }}>삭제</th>
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
                                            <td colSpan={6} className="text-center text-muted py-3">데이터가 없습니다.</td>
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
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSave}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MenuSelectForm;
