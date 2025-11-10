import './EventCard.css';
import { useContext, useState } from 'react';
import { StoreContext } from '../../Contexts/StoreContext';

const EventCard = ({eventDatas}) => {
    const { eventType, setPopUpStatus, selectEvent, selectedEvent } = useContext(StoreContext);
    const [flippedCard, setFlippedCard] = useState(null);

    const normalizeType = (event) => {
        if (event.eventType) return event.eventType;
        if (event.category) {
            const c = String(event.category).toLowerCase();
            if (c === 'technical') return 'Technical';
            if (c === 'cultural') return 'Cultural';
            if (c === 'special') return 'Special';
        }
        return '';
    };

    const getId = (event) => event._id ?? event.id;
    const getTitle = (event) => event.eventName ?? event.title ?? '';
    const getImage = (event) => {
        if (event.image) return event.image;
        if (event.eventSubName) return `/${event.eventSubName}.jpg`;
        return '/error.jpg';
    };

    const isTeamEvent = (event) => {
        const size = event?.teamSize;
        if (!size) return false;
        const s = String(size).toLowerCase();
        if (s.includes('team')) return true;
        const nums = String(size).match(/\d+/g);
        return nums ? Number(nums?.[0]) > 1 : false;
    };

    const toggleFlip = (id) => setFlippedCard(prevId => (prevId === id ? null : id));

    return (
        <> 
            {eventDatas
                .filter(event => normalizeType(event) === eventType) 
                .map(event => {
                    const id = getId(event);
                    const title = getTitle(event);
                    const imgSrc = getImage(event);
                    const isSelected = selectedEvent.includes(id);
                    const isFlipped = flippedCard === id;
                    return (
                    <div key={id} className="card-container-events">
                        <div
                            className={`event-card ${isFlipped ? 'flipped' : ''}`}
                            onClick={() => toggleFlip(id)}
                        >
                            <div className="front"> 
                                <img 
                                    src={imgSrc} 
                                    onError={(e) => { e.target.src = '/error.jpg'; }}
                                    alt={title} 
                                />
                                <div className="event-card-content">
                                    <div className="card-front-top">
                                        <div className="event-card-names">
                                            <p>{title}</p>
                                            {event.eventSubName && <p className='event-subname'>{event.eventSubName}</p>}
                                        </div>
                                    </div>
                                    <div className="event-buttons">
                                        <button 
                                            onClick={(e) => { 
                                                if (isTeamEvent(event)) {
                                                    setPopUpStatus({ event, mode: 'add' });
                                                } else {
                                                    selectEvent(id);
                                                }
                                                e.stopPropagation() 
                                            }} 
                                            className={`button-event ${isSelected ? 'clicked' : ''}`}
                                        >
                                            {isSelected ? 'EVENT ADDED' : 'ADD EVENT'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="back">
                                <div className="back-div">
                                    <div className="event-back-dec">
                                        <p>{event.description}</p>
                                    </div>
                                    {/* View Rules button moved to the back of the card */}
                                    <div className="event-buttons-back">
                                        <button 
                                            onClick={(e) => { 
                                                setPopUpStatus({ event, mode: 'rules' }); 
                                                e.stopPropagation() 
                                            }} 
                                            className='view-rule-btn'
                                        >
                                            View Rules
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
        </>
    );
};

export default EventCard;