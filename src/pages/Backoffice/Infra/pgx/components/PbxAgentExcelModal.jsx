import React, { useState, useCallback, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PbxAgentExcelModal = ({ open, onClose, onSuccess }) => {
    const [basicNumber, setBasicNumber] = useState('');
    const [parsedAgents, setParsedAgents] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const XLSX = window.XLSX || (await import('xlsx'));
            const reader = new FileReader();
            reader.onload = (evt) => {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                const agents = json.map(row => ({ extension: row['Agent'] })).filter(a => a.extension);
                setParsedAgents(agents);
            };
            reader.readAsBinaryString(file);
        } catch {
            await Swal.fire({ icon: 'error', text: 'Excel ?åÏùº ?åÏã±???§Ìå®?àÏäµ?àÎã§. xlsx ?ºÏù¥Î∏åÎü¨Î¶¨Í? ?ÑÏöî?©Îãà??' });
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!basicNumber.trim()) {
            await Swal.fire({ icon: 'warning', text: 'Î≥µÏÇ¨???êÏù¥?ÑÌä∏Î•??ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        if (parsedAgents.length === 0) {
            await Swal.fire({ icon: 'warning', text: 'Excel ?åÏùº??Î®ºÏ? ?ÖÎ°ú?úÌï¥ Ï£ºÏÑ∏??' });
            return;
        }
        const ok = await Swal.fire({
            icon: 'question',
            title: '?ÅÎã¥???êÏù¥?ÑÌä∏',
            text: '?±Î°ù ?òÏãúÍ≤†Ïäµ?àÍπå?',
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.AGENT_EXCEL_UPDATE,
                method: 'POST',
                data: {
                    basicNumber: basicNumber.replaceAll(' ', ''),
                    copyNumber: parsedAgents,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '?±Î°ù', text: json?.MESSAGE || '?±Î°ù?òÏóà?µÎãà??' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', title: '?§Î•ò', text: json?.MESSAGE || '?±Î°ù???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '?§Î•ò', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [basicNumber, parsedAgents, onSuccess]);

    const handleClose = useCallback(() => {
        setBasicNumber('');
        setParsedAgents([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    }, [onClose]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 520, maxWidth: '90%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?ëÏ? ?ÖÎ°ú??/h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={handleClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?ëÏ? ?ÖÎ°ú???åÏùº</label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="form-control"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileChange}
                                            />
                                            {parsedAgents.length > 0 && (
                                                <div className="mt-1 text-muted small">
                                                    {parsedAgents.length}Í∞??êÏù¥?ÑÌä∏ ?åÏã± ?ÑÎ£å
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="txt_basicNumber" className="form-label">Î≥µÏÇ¨???¥ÏÑ†Î≤àÌò∏</label>
                                            <input
                                                id="txt_basicNumber"
                                                type="text"
                                                className="form-control"
                                                placeholder="Î≥µÏÇ¨???êÏù¥?ÑÌä∏ Î≤àÌò∏Î•??ÖÎ†•?òÏÑ∏??"
                                                value={basicNumber}
                                                onChange={e => setBasicNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={handleClose}>Ï∑®ÏÜå</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>?ÖÎ°ú??/button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PbxAgentExcelModal;
