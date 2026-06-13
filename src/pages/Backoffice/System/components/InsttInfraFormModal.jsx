import React, { useCallback } from 'react';
import URL from "@/constants/URL.jsx";
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import CODE from '@/constants/CODE.jsx';
import { alert } from '@/lib/alert.js';


const INITIAL_INSTT_INFRA_INFOFORM = {
    mode : 'Ins',
    insttCode : '',
    partInfraCode : '',
    stationStartNumber : '',
    stationEndNumber : '',
    agentStartNumber : '',
    agentEndNumber : '',
    ctiStartNumber : '',
    ctiEndNumber : '',
    ipStart : '',
    ipEnd : '',
    stationMeno : '',
    partEtc1 : '',
    partEtc2 : '',
};

const cols = [
    { label: '제목', width: 160, colspan :1 },
    { label: '내선번호', width: 180 , colspan :2},
    { label: '에이전트', width: 180 , colspan :2},
    { label: 'CTI', width: 180 , colspan :2},
    { label: 'IP', width: 180 , colspan :2},
    { label: '수정', width: 80 },
    { label: '삭제', width: 80 },
];

// end 필드 → 대응하는 start 필드 매핑
const RANGE_PAIRS = {
    stationEndNumber: 'stationStartNumber',
    agentEndNumber:   'agentStartNumber',
    ctiEndNumber:     'ctiStartNumber',
    ipEnd:            'ipStart',
};

const ipToNum = (ip) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return NaN;
    return parts.reduce((acc, oct) => {
        const n = Number(oct);
        return n >= 0 && n <= 255 ? acc * 256 + n : NaN;
    }, 0);
};

const TheadRow = () => (
    <thead>
        <tr>
            {cols.map((c) => (
                <th key={c.label} colspan={c.colspan ? c.colspan : 1} style={{ width: c.width, minWidth: c.width, whiteSpace: 'nowrap' }}>
                    {c.label}
                </th>
            ))}
        </tr>
    </thead>
);

const InsttInfraFormModal = ({
    open, 
    onClose,   
    insttInfo, 
}) => {

    const [infraData, setInfraData] = React.useState([]);
    const [form, setForm] = React.useState(INITIAL_INSTT_INFRA_INFOFORM);
    const [errors, setErrors] = React.useState({});
    const totalWidth = cols.reduce((s, c) => s + c.width, 0); // 1010px
    const handleSettleDetailView = async({insttInfo})=>{
        //데이터 불러 와서 
        try{
            const res  = await fnAjaxFetch({
                url: URL.INSTT_INFRA_LIST,
                method: 'POST',
                data: { searchInsttCode : insttInfo},
                withCredentials: true,
            });
            if (res?.data?.resultCodeInfo === 'SUCCESS') {
                const reportObj = res?.data?.result?.resultList;
                setInfraData(reportObj);
            } else {
                // 2. data -> res.data로 수정, await 중복 제거
                await alert.error(res?.data?.resultMessage || '조회 중 문제가 발생하였습니다.');
            }
        }catch(error){
            await alert.error(error?.message || '처리 중 오류가 발생했습니다.');
        }
    };

    React.useEffect(()=>{
        if(!insttInfo) return;
        let active = true;
        fnAjaxFetch({ url: URL.INSTT_INFRA_LIST, method: 'POST', data: { searchInsttCode: insttInfo }, withCredentials: true })
            .then(res => {
                if (!active) return;
                if (res?.data?.resultCodeInfo === 'SUCCESS') setInfraData(res?.data?.result?.resultList || []);
            })
            .catch(() => {});
        return () => { active = false; };
    },[insttInfo]);

    // insttCode
    const submitForm = React.useMemo(() => ({
        ...form,
        insttCode: insttInfo || form.insttCode,
    }), [form, insttInfo]);

    const { handleSubmit } = useCommonSubmit({
        form: submitForm,
        type: 'json',
        checkField: [
            { inputId: "stationStartNumber", inputType: CODE.TEXT, message: "시작 번호" },
            { inputId: "stationEndNumber", inputType: CODE.TEXT, message: "종료 번호" },
            { inputId: "agentStartNumber", inputType: CODE.TEXT, message: "시작 번호" },
            { inputId: "agentEndNumber", inputType: CODE.TEXT, message: "종료 번호" },
            { inputId: "ctiStartNumber", inputType: CODE.TEXT, message: "시작 번호" },
            { inputId: "ctiEndNumber", inputType: CODE.TEXT, message: "종료 번호" },
        ],
        cnfiremMessage: `${form.stationMeno} " 정보를`,
        URL: URL.INSTT_CALL_INFRA_UPDATE,
        reloadFunction: () => {
            handleSettleDetailView({insttInfo:insttInfo});
        },
    });

    /* ----- 삭제 ----- */
    const { handleDelete } = useCommonDelete({
        URL: URL.INSTT_CALL_INFRA_INFO,
        MESSAGE: '사용자 정보',
        reloadFunction: () => {
            handleSettleDetailView({insttInfo:insttInfo});
        },
    });

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        let next = { ...form, [name]: value };

        // 에이전트 시작/종료 둘 다 입력되면 CTI에 자동 복사
        if (name === 'agentStartNumber' || name === 'agentEndNumber') {
            const start = name === 'agentStartNumber' ? value : next.agentStartNumber;
            const end   = name === 'agentEndNumber'   ? value : next.agentEndNumber;
            if (start && end) {
                next = { ...next, ctiStartNumber: start, ctiEndNumber: end };
            }
        }

        setForm(next);

        // start/end 범위 검증
        const newErrors = {};
        Object.entries(RANGE_PAIRS).forEach(([endKey, startKey]) => {
            const s = next[startKey];
            const e = next[endKey];
            if (!s || !e) return;
            if (endKey === 'ipEnd') {
                const sn = ipToNum(s);
                const en = ipToNum(e);
                newErrors[endKey] = !isNaN(sn) && !isNaN(en) && en < sn;
            } else {
                newErrors[endKey] = Number(e) < Number(s);
            }
        });
        setErrors(newErrors);
    }, [form]);

    const handleModify = ({ mode, data }) => {
       if (mode === 'Ins') {
            setForm({
                ...INITIAL_INSTT_INFRA_INFOFORM,
                mode: 'Ins',
                insttCode: insttInfo,
            });
        } else if (mode === 'Edt') {
            setForm({
                ...data,
                mode: 'Edt',
            });
        }
    }
    
    
    if (!open) return null;
    return (
        <>
            <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
                <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                    <div
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{
                            width: '90vw',           // ✅ 뷰포트 기준
                            maxWidth: '90vw',       // ✅ maxWidth도 vw로
                            marginLeft: 'auto',     // ✅ 중앙 정렬
                            maxHeight: '80vh',
                            marginRight: 'auto',
                            background: '#fff',
                        }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">
                                        INFRA 관리
                                    </h2>
                                </div>
                                <button type="button" className="modal-close" onClick={onClose} aria-label="Close" />
                            </div>

                            <div className="modal-body">
                                
                                    <div
                                        className="modal-body__content"
                                        style={{
                                            maxHeight: '60vh',
                                            width: '100%',        // ✅ 90vw 그대로 받음
                                        }}
                                    >

                                    {/* ✅ 테이블 스크롤 래퍼 */}
                                    <div style={{  overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                        

                                        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                            <table
                                                className="content-table__sub"
                                                style={{ width: '100%',  background: '#fff', minWidth: totalWidth, tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                            >
                                                <TheadRow />
                                                <tbody>
                                                    {infraData.map((r, i) => {
                                                        return (
                                                            <tr key={i} style={{ backgroundColor: 'transparent' }}>
                                                                <td>{r.stationMeno}</td>
                                                                <td colSpan={2}>{r.stationStartNumber}~{r.stationEndNumber}</td>
                                                                <td colSpan={2}>{r.agentStartNumber}~{r.agentEndNumber}</td>
                                                                <td colSpan={2}>{r.ctiStartNumber}~{r.ctiEndNumber}</td>
                                                                <td colSpan={2}>{r.ipStart}~{r.ipEnd}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-primary" onClick={() => handleModify({ mode: "Ins", data: r })}>
                                                                        수정
                                                                    </button>
                                                                </td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete({ code: r?.partInfraCode, name: r?.stationMeno })}>
                                                                        삭제
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                    <tr>
                                                        <td>
                                                            <input
                                                                id="stationMeno"
                                                                name="stationMeno"
                                                                type="text"
                                                                className="form-control"
                                                                 placeholder="제목 입력"
                                                                value={form.stationMeno}
                                                                onChange={updateForm}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="stationStartNumber"
                                                                name="stationStartNumber"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="시작 번호"
                                                                value={form.stationStartNumber}
                                                                onChange={updateForm}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="stationEndNumber"
                                                                name="stationEndNumber"
                                                                type="text"
                                                                className={`form-control${errors.stationEndNumber ? ' is-invalid' : ''}`}
                                                                placeholder="종료 번호"
                                                                value={form.stationEndNumber}
                                                                onChange={updateForm}
                                                            />
                                                            {errors.stationEndNumber && <div className="invalid-feedback">종료 번호가 시작 번호보다 커야 합니다.</div>}
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="agentStartNumber"
                                                                name="agentStartNumber"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="에이전트 시작 번호"
                                                                value={form.agentStartNumber}
                                                                onChange={updateForm}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="agentEndNumber"
                                                                name="agentEndNumber"
                                                                type="text"
                                                                className={`form-control${errors.agentEndNumber ? ' is-invalid' : ''}`}
                                                                placeholder="에이전트 종료 번호"
                                                                value={form.agentEndNumber}
                                                                onChange={updateForm}
                                                            />
                                                            {errors.agentEndNumber && <div className="invalid-feedback">종료 번호가 시작 번호보다 커야 합니다.</div>}
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="ctiStartNumber"
                                                                name="ctiStartNumber"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="CTI 시작 번호"
                                                                value={form.ctiStartNumber}
                                                                onChange={updateForm}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                inputMode="numeric"
                                                                id="ctiEndNumber"
                                                                name="ctiEndNumber"
                                                                type="text"
                                                                className={`form-control${errors.ctiEndNumber ? ' is-invalid' : ''}`}
                                                                placeholder="CTI 종료 번호"
                                                                value={form.ctiEndNumber}
                                                                onChange={updateForm}
                                                            />
                                                            {errors.ctiEndNumber && <div className="invalid-feedback">종료 번호가 시작 번호보다 커야 합니다.</div>}
                                                        </td>
                                                        <td>
                                                            <input
                                                                id="ipStart"
                                                                name="ipStart"
                                                                type="text"
                                                                className="form-control"
                                                                placeholder="시작 IP"
                                                                value={form.ipStart}
                                                                onChange={updateForm}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                id="ipEnd"
                                                                name="ipEnd"
                                                                type="text"
                                                                className={`form-control${errors.ipEnd ? ' is-invalid' : ''}`}
                                                                placeholder="종료 IP"
                                                                value={form.ipEnd}
                                                                onChange={updateForm}
                                                            />
                                                            {errors.ipEnd && <div className="invalid-feedback">종료 IP가 시작 IP보다 커야 합니다.</div>}
                                                        </td>
                                                        <td colSpan={2}>
                                                            <button className="btn btn-sm btn-success" style={{ width: '80%' }} onClick={handleSubmit}>
                                                                {form.mode === 'Edt' ? '수정' : '추가'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-footer__left">
                                    
                                </div>
                                <div className="modal-footer__right">
                                    <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

};

export default InsttInfraFormModal;
