import './EventPopup.css'
import { StoreContext } from '../../Contexts/StoreContext';
import React, { useContext } from 'react';

const EventPopup = () => {
    const { setPopUpStatus, popUpStatus, selectEvent, selectedEvent, eventRegistrations, setEventRegistrations } = useContext(StoreContext);

    const getEventObj = () => (popUpStatus && popUpStatus.event) ? popUpStatus.event : popUpStatus;
    const getMode = () => (popUpStatus && popUpStatus.mode) ? popUpStatus.mode : 'rules';

    const eventObj = getEventObj();
    const mode = getMode();

    const getId = (e) => e?._id ?? e?.id;
    const getTitle = (e) => e?.eventName ?? e?.title ?? '';
    const getRules = (e) => e?.rules ?? e?.detailedRules ?? [];
    const isTeamEvent = (e) => {
        const size = e?.teamSize;
        if (!size) return false;
        if (String(size).toLowerCase().includes('team')) return true;
        const nums = String(size).match(/\d+/g);
        return nums ? Number(nums?.[0]) > 1 : false;
    };
    const parseMaxMembers = (e) => {
        const ts = e?.teamSize ? String(e.teamSize) : '';
        const nums = ts.match(/\d+/g);
        if (nums && nums.length) {
            return Math.max(...nums.map(n => Number(n)));
        }
        if (ts.toLowerCase().includes('team')) return 4;
        return 1;
    };

    const id = getId(eventObj);
    const reg = eventRegistrations?.[id] || { leader: { name: "", email: "", phone: "", altPhone: "" }, members: [] };
    const maxMembers = Math.min(parseMaxMembers(eventObj), 4);
    const maxAdditional = Math.max(0, maxMembers - 1);

    const updateReg = (next) => {
        setEventRegistrations(prev => ({ ...prev, [id]: next }));
    };

    const handleLeaderChange = (field, value) => {
        updateReg({ ...reg, leader: { ...(reg.leader || {}), [field]: value } });
    };

    const updateMember = (index, field, value) => {
        const members = Array.isArray(reg.members) ? [...reg.members] : [];
        if (!members[index]) members[index] = { name: "", email: "" };
        members[index] = { ...members[index], [field]: value };
        updateReg({ ...reg, members });
    };

    const addMember = () => {
        const members = Array.isArray(reg.members) ? [...reg.members] : [];
        if (members.length >= maxAdditional) return;
        members.push({ name: "", email: "" });
        updateReg({ ...reg, members });
    };

    const removeMember = (index) => {
        const members = Array.isArray(reg.members) ? [...reg.members] : [];
        members.splice(index, 1);
        updateReg({ ...reg, members });
    };

    const handleSubmitAdd = () => {
        if (isTeamEvent(eventObj)) {
            if (!reg.leader?.name || !reg.leader?.email || !reg.leader?.phone) {
                alert("Please fill all required team leader details (Name, Email, and Phone).");
                return;
            }
            if (!/^\d{10}$/.test(String(reg.leader.phone))) {
                alert("Team leader phone must be exactly 10 digits.");
                return;
            }
            if (reg.leader.altPhone && !/^\d{10}$/.test(String(reg.leader.altPhone))) {
                alert("Alternate phone (if provided) must be exactly 10 digits.");
                return;
            }
            if (Array.isArray(reg.members)) {
                for (const m of reg.members) {
                    if ((m?.name && !m?.email) || (!m?.name && m?.email)) {
                        alert("Each team member must have both name and email, or leave both fields empty.");
                        return;
                    }
                }
            }
        }
        selectEvent(id);
        setPopUpStatus('');
    };

    return (
        <div key={getId(eventObj)} onClick={() => setPopUpStatus('')} className={`event-popup-container ${popUpStatus ? 'show' : ''}`}>
            <div className="event-popup" onClick={(e) => e.stopPropagation()}>
            <img src="/bg-Cultural-phone.jpg" alt="" />
                <div className="close-icon">
                    <i onClick={() => setPopUpStatus('')} className="fa-solid fa-xmark fa-xl" style={{ color: '#ffffff' }}></i>
                </div> 
                <div className="event-content">
                    <div className='pop-main'>
                        {eventObj && typeof eventObj === 'object' ? (
                            <>  
                                <h3 className="event-name">{getTitle(eventObj)}</h3>
                                {eventObj.eventSubName}
                                <p className="event-desc">{eventObj.description}</p>

                                {mode === 'rules' && (
                                    <div className="rule-box">
                                        <h3>Rules</h3>
                                        <div className="rules">
                                            {getRules(eventObj).map((rule, index) => (
                                                <div>
                                                    <div className="rule">
                                                      <p>&#10140;&nbsp;</p>  <p key={index}> {rule}</p>
                                                    </div>

                                                </div>

                                            ))}
                                        </div>
                                        
                                        {/* Add location and time information */}
                                        <div className="event-details-section">
                                            <div className="event-detail-item">
                                                <p className="event-detail-label">Location:</p>
                                                <p className="event-detail-value">{eventObj.venue || "Revealing soon"}</p>
                                            </div>
                                            <div className="event-detail-item">
                                                <p className="event-detail-label">Time:</p>
                                                <p className="event-detail-value">
                                                    {eventObj.date && eventObj.time 
                                                        ? `${eventObj.date} at ${eventObj.time}` 
                                                        : eventObj.date || eventObj.time || "Revealing soon"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {mode === 'add' && isTeamEvent(eventObj) && (
                                    <>
                                        <div className="team-form">
                                            <div className="team-form-header">
                                                <h3>Team Details</h3>
                                            </div>
                                            <div className="team-form-content">
                                                <input 
                                                    type="text" 
                                                    placeholder="Team Leader Name *" 
                                                    value={reg.leader?.name || ""} 
                                                    onChange={(e) => handleLeaderChange('name', e.target.value)} 
                                                />
                                                <input 
                                                    type="email" 
                                                    placeholder="Team Leader Email *" 
                                                    value={reg.leader?.email || ""} 
                                                    onChange={(e) => handleLeaderChange('email', e.target.value)} 
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Team Leader Phone *" 
                                                    value={reg.leader?.phone || ""} 
                                                    onChange={(e) => handleLeaderChange('phone', e.target.value)} 
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Alternate Phone (optional)" 
                                                    value={reg.leader?.altPhone || ""} 
                                                    onChange={(e) => handleLeaderChange('altPhone', e.target.value)} 
                                                />
                                                <h4>Team Members (up to {maxAdditional})</h4>
                                                {Array.isArray(reg.members) && reg.members.map((m, idx) => (
                                                    <div key={idx} className="team-member-row">
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Member ${idx + 1} Name`} 
                                                            value={m.name || ""} 
                                                            onChange={(e) => updateMember(idx, 'name', e.target.value)} 
                                                        />
                                                        <input 
                                                            type="email" 
                                                            placeholder={`Member ${idx + 1} Email`} 
                                                            value={m.email || ""} 
                                                            onChange={(e) => updateMember(idx, 'email', e.target.value)} 
                                                        />
                                                        <i 
                                                            className="fa-solid fa-xmark" 
                                                            onClick={() => removeMember(idx)}
                                                            title="Remove member"
                                                        ></i>
                                                    </div>
                                                ))}
                                                {(reg.members?.length || 0) < maxAdditional && (
                                                    <button 
                                                        type="button" 
                                                        className="view-rule-btn" 
                                                        onClick={addMember}
                                                    >
                                                        <i className="fa-solid fa-plus"></i> Add Member
                                                    </button>
                                                )}
                                                <div className="team-form-note">
                                                    <p><small><i className="fa-solid fa-info-circle"></i> Fields marked with * are required</small></p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="coordinator-details">
                                    <div className="item-flex-popup">
                                        <p className="event-time">{eventObj.time}</p>
                                        <p className="event-time">{eventObj.date}</p>
                                    </div>
                                    <div className="item-flex-popup">
                                        <p>Venue</p><p>{eventObj.venue}</p>
                                    </div>



                                    <div className="item-flex-popup">
                                        <p>{eventObj.studentCoordinator}</p><p>{eventObj.studentCoordinatorContact}</p>
                                    </div>
                                    </div>
                                    {selectedEvent.includes(getId(eventObj)) ? (
                                        <button className='event-selected-button' onClick={() => selectEvent(getId(eventObj))}>Added</button>
                                    ) : (
                                        mode === 'add' ? (
                                            <button className='event-select-button' onClick={handleSubmitAdd}>Add to Cart</button>
                                        ) : null
                                    )}
                                
                            </>
                        ) : (
                            <p>No event selected.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventPopup;
