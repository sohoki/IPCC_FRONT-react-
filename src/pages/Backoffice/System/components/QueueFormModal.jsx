import React, { useCallback } from 'react';
import Swal from '@/lib/swal.js';
import URL from '@/constants/URL.jsx';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { useRadioGroup } from '@/hooks/use-form.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { CommonSelect } from '@/components/Common/select.jsx';


const QueueFormModal = ({ open, onClose, form, setForm, onSubmit }) => {
  const { handleIdCheck } = useIdCheck(URL.QUEUE_ID_CHECK, 'Queue 이름' );
  const { renderRadioGroup } = useRadioGroup(form, setForm);
  const { options: queueTypeOptions } = useCommonCodeData('QUEUE_TYPE');

  const onCheckId = useCallback(async () => {
    await handleIdCheck(form.queue, setForm, { gubun: 'queue'});
  }, [form.queue, setForm, handleIdCheck]);

  const updateForm = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'queue' ? { idCheck: 'N' } : {}),
    }));
  }, [setForm]);

  const handleValidatedSubmit = useCallback(async () => {
    if (!form.queue?.trim()) {
      await Swal.fire({ icon: 'warning', text: 'Queue 이름을 입력해 주세요.' });
      return;
    }
    if (form.idCheck !== 'Y') {
      await Swal.fire({ icon: 'warning', text: 'Queue 이름 중복확인을 해주세요.' });
      return;
    }
    onSubmit();
  }, [form, onSubmit]);

  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-custom">
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{ width: 500, maxWidth: '90%', backgroundColor: '#fff' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h2 className="modal-title__title">Queue 등록</h2>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">

                  {/* Queue 이름 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label htmlFor="queue" className="form-label">
                        Queue 이름 <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          id="queue"
                          name="queue"
                          type="text"
                          className="form-control"
                          placeholder="Queue 이름을 입력해 주세요."
                          value={form.queue ?? ''}
                          onChange={updateForm}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-default__blue"
                          onClick={onCheckId}
                        >
                          중복확인
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 내구성(Durable) */}
                  {renderRadioGroup({
                    label: '내구성(Durable)',
                    name: 'routingKey',
                    options: [
                      { value: 'Y', text: '영구' },
                      { value: 'N', text: '일시' },
                    ],
                    col: 'col-6',
                    useSwitch: true,
                  })}

                  {/* 자동삭제 */}
                  {renderRadioGroup({
                    label: '자동삭제(Auto Delete)',
                    name: 'type',
                    options: [
                      { value: 'Y', text: '자동' },
                      { value: 'N', text: '수동' },
                    ],
                    col: 'col-6',
                    useSwitch: true,
                  })}

                  {/* Queue 유형 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label htmlFor="queueType" className="form-label">Queue 유형</label>
                      <CommonSelect
                        comboId="queueType"
                        comboData={queueTypeOptions}
                        className="form-select"
                        value={form.queueType ?? ''}
                        onChange={updateForm}
                        placeholder="선택"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer__left" />
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleValidatedSubmit}>저장</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueFormModal;
