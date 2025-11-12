import './EventPopup.css'
import { StoreContext } from '../../Contexts/StoreContext';
import React, { useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

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
        if (String(size).toLowerCase().includes('individual')) return false;
        if (String(size).toLowerCase().includes('team')) return true;
        
        // Check for ranges like "1-2 members"
        const nums = String(size).match(/\d+/g);
        if (nums && nums.length >= 2) {
            // For ranges, check if any number is greater than 1
            return nums.some(num => Number(num) > 1);
        }
        
        // For single numbers
        return nums ? Number(nums?.[0]) > 1 : false;
    };
    
    const parseTeamSizeRequirements = (e) => {
        const title = getTitle(e)?.toLowerCase();
        const ts = e?.teamSize ? String(e.teamSize) : '';
        
        // Specific event mappings with min/max requirements (including team leader in count)
        if (title === "eyes off! code on") return { min: 1, max: 2 }; // 1-2 total including leader
        if (title === "webverse") return { min: 2, max: 2 }; // 2 total including leader
        if (title === "line quest") return { min: 3, max: 5 }; // 3-5 total including leader
        if (title === "shark tank") return { min: 2, max: 4 }; // 2-4 total including leader
        if (title === "dashing dashboards") return { min: 1, max: 2 }; // 1-2 total including leader (individual or team of 2)
        if (title === "aqua ignition") return { min: 2, max: 2 }; // 2 total including leader
        if (title === "flight embers") return { min: 2, max: 2 }; // 2 total including leader
        if (title === "protoview") return { min: 2, max: 4 }; // 2-4 total including leader
        if (title === "botfury") return { min: 2, max: 3 }; // 2-3 total including leader
        if (title === "circuit craze") return { min: 2, max: 2 }; // 2 total including leader
        if (title === "gerber battle") return { min: 1, max: 2 }; // 1-2 total including leader (can be individual or team)
        if (title === "agni chakravyuha") return { min: 4, max: 4 }; // 4 total including leader
        
        // Parse from teamSize field for min/max (including team leader in count)
        const nums = ts.match(/\d+/g);
        if (nums && nums.length >= 2) {
            // For ranges like "2-4 members", first number is min, second is max (including leader)
            const min = Number(nums[0]);
            const max = Number(nums[1]);
            return { min, max };
        } else if (nums && nums.length === 1) {
            // For single number like "team of 2", min and max are the same (including leader)
            const count = Number(nums[0]);
            return { min: count, max: count };
        }
        
        // Default for team events
        if (ts.toLowerCase().includes('team')) return { min: 2, max: 4 };
        
        // Individual events
        return { min: 1, max: 1 };
    };

    const id = getId(eventObj);
    const reg = eventRegistrations?.[id] || { 
        teamName: "", 
        leader: { name: "", email: "", phone: "", altPhone: "" }, 
        members: [] 
    };
    const teamRequirements = parseTeamSizeRequirements(eventObj);
    const maxAdditional = teamRequirements.max > 0 ? teamRequirements.max - 1 : 0; // Maximum additional members (excluding leader)
    const minAdditional = teamRequirements.min > 0 ? teamRequirements.min - 1 : 0; // Minimum additional members (excluding leader)
    const maxMembers = teamRequirements.max; // Total team size (including leader)
    const minMembers = teamRequirements.min; // Minimum team size (including leader)

    // Effect to validate team registration when popup opens
    useEffect(() => {
        if (popUpStatus && mode === 'add' && isTeamEvent(eventObj) && selectedEvent.includes(id)) {
            const isValid = validateTeamRegistration(reg, minMembers, maxMembers);
            if (!isValid) {
                // If validation fails, remove the event from selectedEvent
                selectEvent(id);
            }
        }
    }, [popUpStatus, mode, eventObj, selectedEvent, id, reg, minMembers, maxMembers]);

    const validateTeamRegistration = (registrationData, minMembers, maxMembers) => {
        // Skip validation if this is not a team event
        if (!isTeamEvent(eventObj)) return true;
        
        const { teamName, leader, members = [] } = registrationData;
        
        // Check if team name is required and provided
        if (!teamName && minMembers > 1) {
            toast.error("Please enter a team name");
            return false;
        }
        
        // Check if leader details are required and provided
        if (minMembers > 0) {
            if (!leader?.name) {
                toast.error("Please enter team leader name");
                return false;
            }
            
            if (!leader?.email) {
                toast.error("Please enter team leader email");
                return false;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(leader.email)) {
                toast.error("Please enter a valid email address for team leader");
                return false;
            }
            
            if (!leader?.phone) {
                toast.error("Please enter team leader phone number");
                return false;
            }
            
            // Validate phone number format (10 digits)
            if (!/^\d{10}$/.test(String(leader.phone))) {
                toast.error("Please enter a valid 10-digit phone number for team leader");
                return false;
            }
            
            // Validate alternate phone number format if provided
            if (leader.altPhone && !/^\d{10}$/.test(String(leader.altPhone))) {
                toast.error("Please enter a valid 10-digit alternate phone number");
                return false;
            }
        }
        
        // Count filled members (including team leader)
        const leaderFilled = leader?.name && leader?.email && leader?.phone ? 1 : 0;
        const membersFilled = Array.isArray(members) 
            ? members.filter(m => m?.name && m?.email).length 
            : 0;
        const filledMembers = leaderFilled + membersFilled;
        
        // Validate minimum team size (including team leader)
        if (filledMembers < minMembers) {
            toast.error(`This event requires a minimum of ${minMembers} team members (including leader). Please add ${minMembers - filledMembers} more member(s).`);
            return false;
        }
        
        // Validate maximum team size (including team leader)
        if (filledMembers > maxMembers) {
            toast.error(`This event allows a maximum of ${maxMembers} team members (including leader). Please remove ${filledMembers - maxMembers} member(s).`);
            return false;
        }
        
        // Validate each member has both name and email or both are empty
        if (Array.isArray(members)) {
            for (let i = 0; i < members.length; i++) {
                const m = members[i];
                if ((m?.name && !m?.email) || (!m?.name && m?.email)) {
                    toast.error(`Please provide both name and email for member ${i + 1}, or leave both fields empty`);
                    return false;
                }
                
                // Validate email format for members
                if (m?.email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(m.email)) {
                        toast.error(`Please enter a valid email address for member ${i + 1}`);
                        return false;
                    }
                }
            }
        }
        
        return true;
    };

    const updateReg = (next) => {
        setEventRegistrations(prev => {
            const newRegistrations = { ...prev, [id]: next };
            
            // Validate the registration data whenever it changes
            if (isTeamEvent(eventObj) && selectedEvent.includes(id)) {
                const isValid = validateTeamRegistration(next, minMembers, maxMembers);
                if (!isValid) {
                    // If validation fails, remove the event from selectedEvent
                    selectEvent(id);
                }
            }
            
            return newRegistrations;
        });
    };

    const handleLeaderChange = (field, value) => {
        updateReg({ ...reg, leader: { ...(reg.leader || {}), [field]: value } });
    };

    const handleTeamNameChange = (e) => {
        updateReg({ ...reg, teamName: e.target.value });
    };

    const updateMember = (index, field, value) => {
        const members = Array.isArray(reg.members) ? [...reg.members] : [];
        if (!members[index]) members[index] = { name: "", email: "" };
        members[index] = { ...members[index], [field]: value };
        updateReg({ ...reg, members });
    };

    const addMember = () => {
        const members = Array.isArray(reg.members) ? [...reg.members] : [];
        // Check if we've reached the maximum allowed members for this event
        if (members.length >= maxAdditional) {
            alert(`This event allows a maximum of ${maxMembers} team members (including leader).`);
            return;
        }
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
            const isValid = validateTeamRegistration(reg, minMembers, maxMembers);
            if (!isValid) {
                // The validation function already shows alerts for specific errors
                // Just return without adding the event
                return;
            }
        }
        selectEvent(id);
        setPopUpStatus('');
    };

    return (
        <div key={getId(eventObj)} onClick={() => setPopUpStatus('')} className={`event-popup-container ${popUpStatus ? 'show' : ''}`}>
            <div className="event-popup" onClick={(e) => e.stopPropagation()}>
                <div className="event-popup-bg">
                    <img src="/bg-Cultural-phone.jpg" alt="" />
                </div>
                <div className="close-icon">
                    <i onClick={(e) => { e.stopPropagation(); setPopUpStatus(''); }} className="fa-solid fa-xmark fa-xl" style={{ color: '#ffffff' }}></i>
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
                                                <div className="rule" key={index}>
                                                    <span className="rule-arrow">➜</span>
                                                    <span className="rule-text">{rule}</span>
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
                                
                                {/* Faculty and Student Coordinator information - placed in one container */}
                                {(eventObj.organizer || eventObj.studentCoordinator) && mode === 'rules' && (
                                    <div className="coordinator-container">
                                        <h3>Event Coordinators</h3>
                                        <div className="coordinator-content">
                                            {eventObj.organizer && (
                                                <div className="coordinator-item">
                                                    <p className="coordinator-label">Faculty Coordinator:</p>
                                                    <p className="coordinator-value">{eventObj.organizer}</p>
                                                    {eventObj.contact && <p className="coordinator-contact">Contact: {eventObj.contact}</p>}
                                                </div>
                                            )}
                                            {eventObj.studentCoordinator && (
                                                <div className="coordinator-item">
                                                    <p className="coordinator-label">Student Coordinator:</p>
                                                    <p className="coordinator-value">{eventObj.studentCoordinator}</p>
                                                </div>
                                            )}
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
                                                    placeholder="Team Name *" 
                                                    value={reg.teamName || ""} 
                                                    onChange={handleTeamNameChange} 
                                                />
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
                                                <h4>
                                                    {minMembers === maxMembers 
                                                        ? `Teams must consist of exactly ${minMembers} members.` 
                                                        : `Team Members (${minMembers}-${maxMembers} members total)`}
                                                </h4>
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
                                                {Array.isArray(reg.members) && reg.members.length >= minAdditional && minAdditional > 0 && minMembers !== maxMembers && (
                                                    <div className="team-form-note">
                                                        <p><small><i className="fa-solid fa-check-circle" style={{color: '#4CAF50'}}></i> Team size requirement met ({minMembers}-{maxMembers} members)</small></p>
                                                    </div>
                                                )}
                                                {Array.isArray(reg.members) && reg.members.length < minAdditional && minAdditional > 0 && (
                                                    <div className="team-form-note">
                                                        <p><small><i className="fa-solid fa-exclamation-triangle" style={{color: '#FFC107'}}></i> Requires {minMembers}-{maxMembers} team members</small></p>
                                                    </div>
                                                )}
                                                <div className="team-form-note">
                                                    <p><small><i className="fa-solid fa-info-circle"></i> Fields marked with * are required</small></p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
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
