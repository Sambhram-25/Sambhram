import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { eventsData } from "../sampleDB"; // Import the sample database

const url = process.env.REACT_APP_URL;
const razorpayKey = process.env.REACT_APP_RAZORPAY_ID;

export const StoreContext = createContext();

export const ContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [eventType, setEventType] = useState("Cultural");
  const [popUpStatus, setPopUpStatus] = useState("");
  const [eventDatas, setEventDatas] = useState([]);
  const [amount, setAmount] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [eventRegistrations, setEventRegistrations] = useState(() => {
    const savedRegistrations = sessionStorage.getItem("eventRegistrations");
    if (savedRegistrations) {
      try {
        return JSON.parse(savedRegistrations);
      } catch (error) {
        console.error("Error parsing saved event registrations:", error);
      }
    }
    return {}; // per-event details entered from popup
  });

  const [stOrderId, setStOrderId] = useState(() => {
    const savedOrderIds = localStorage.getItem("stOrderIds");

    if (savedOrderIds) {
      const parsedIds = JSON.parse(savedOrderIds);
      return Array.isArray(parsedIds) ? parsedIds : [parsedIds];
    }
    return [];
  });

  const [data, setData] = useState(() => {
    const savedData = sessionStorage.getItem("registrationFormData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error("Error parsing saved registration data:", error);
      }
    }
    return {
      name: "",
      email: "",
      college: "",
      branch: "",
      mobile: "",
      Othercollege: "",
      Otherbranch: "",
      // Team details (optional; shown only for team events)
      teamLeaderName: "",
      teamLeaderEmail: "",
      teamLeaderPhone: "",
      teamLeaderAltPhone: "",
      teamMembers: [] // [{ name, email }]
    };
  });

  const [selectedEvent, setSelectedEvent] = useState(() => {
    const savedEvents = localStorage.getItem("selectedEvent");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });

  const [paymentStatus, setPaymentStatus] = useState({
    participantId: null,
    orderId: null,
    isSuccess: false,
  });

  useEffect(() => {
    localStorage.setItem("selectedEvent", JSON.stringify(selectedEvent));
  }, [selectedEvent]);

  useEffect(() => {
    localStorage.setItem("eventDatas", JSON.stringify(eventDatas));
  }, [eventDatas]);

  // Save registration form data to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("registrationFormData", JSON.stringify(data));
  }, [data]);

  // Save event registrations (team details) to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("eventRegistrations", JSON.stringify(eventRegistrations));
  }, [eventRegistrations]);

  useEffect(() => {
    loadEvents();
  }, []);

  const isIndividualEvent = (e) => {
    const size = e?.teamSize;
    if (!size) return true;
    const s = String(size).toLowerCase();
    if (s.includes('individual')) return true;
    if (s.includes('team')) return false;
    const nums = String(size).match(/\d+/g);
    return nums ? Number(nums?.[0]) <= 1 : true;
  };

  const loadEvents = async () => {
    try {
      const cachedData = localStorage.getItem("eventDatas");
      if (cachedData) {
        setEventDatas(JSON.parse(cachedData));
      }
      // Use sample data directly instead of fetching from API
      setEventDatas(eventsData);
      localStorage.setItem("eventDatas", JSON.stringify(eventsData));
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
    }
  };

  // Comment out the API fetch function since we're using sample data
  /*
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${url}/api/v1/auth/events`);
      const newEventDatas = response.data;

      if (Array.isArray(newEventDatas)) {
        setEventDatas(newEventDatas);
        localStorage.setItem("eventDatas", JSON.stringify(newEventDatas));
      } else {
        throw new Error("Invalid event data format");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  };
  */

  const closed_events = [
  ];

  const selectEvent = (id) => {
    if (closed_events.includes(id)) {
      toast.error("This event is closed");
      return;
    }

    if (selectedEvent.includes(id)) {
      setSelectedEvent((prev) => prev.filter((eventId) => eventId !== id));
    } else {
      setSelectedEvent((prev) => [...prev, id]);
    }
  };

  const validatePaymentData = () => {
    const resolvedCollege = data.college === "Other" ? data.Othercollege : data.college;
    const resolvedBranch = data.branch === "Other" ? data.Otherbranch : data.branch;

    const missingFields = [];

    if (!data.name) missingFields.push("name");
    if (!data.email) missingFields.push("email");
    if (!resolvedCollege) missingFields.push("college");
    if (!resolvedBranch) missingFields.push("branch");
    if (!data.mobile) missingFields.push("mobile");

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email");
    }

    if (!selectedEvent.length) {
      throw new Error("Please select at least one event");
    }

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }
  };

  const preparePaymentData = () => {
    const resolvedCollege = data.college === "Other" ? data.Othercollege : data.college;
    const resolvedBranch = data.branch === "Other" ? data.Otherbranch : data.branch;

    // include global team details if provided (legacy)
    const teamDetails = {
      leader: {
        name: data.teamLeaderName || undefined,
        email: data.teamLeaderEmail || undefined,
        phone: data.teamLeaderPhone || undefined,
        altPhone: data.teamLeaderAltPhone || undefined,
      },
      members: (data.teamMembers || []).filter(m => m?.name || m?.email).map(m => ({
        name: m.name || "",
        email: m.email || ""
      }))
    };

    return {
      name: data.name,
      email: data.email,
      college: resolvedCollege,
      branch: resolvedBranch,
      phone: data.mobile,
      amount: amount,
      registrations: selectedEvent.map((id) => ({
        event_id: id,
        details: eventRegistrations?.[id] || {}
      })),
      teamDetails
    };
  };

  const sendDatatoBackend = async () => {
    try {
      validatePaymentData();
      const paymentData = preparePaymentData();

      setLoading(true);
      const response = await axios.post(
        `${url}/api/v1/auth/payment`,
        paymentData
      );

      if (!response.data?.orderId) {
        throw new Error("Invalid response from payment server");
      }

      return {
        participantId: response.data.participantId,
        orderId: response.data.orderId,
        amount: response.data.amount,
        currency: response.data.currency || "INR",
      };
    } catch (error) {
      console.error("Backend request failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (response, paymentDetails) => {
    const existingOrderIds = JSON.parse(
      localStorage.getItem("stOrderIds") || "[]"
    );

    const currentOrderIds = Array.isArray(existingOrderIds)
      ? existingOrderIds
      : existingOrderIds
      ? [existingOrderIds]
      : [];

    const updatedOrderIds = [...currentOrderIds, paymentDetails.orderId];

    localStorage.setItem("stOrderIds", JSON.stringify(updatedOrderIds));

    setStOrderId(updatedOrderIds);

    setPaymentStatus({
      participantId: paymentDetails.participantId,
      orderId: paymentDetails.orderId,
      isSuccess: true,
    });

    setSelectedEvent([]);
    navigate("/success", {
      state: {
        participantId: paymentDetails.participantId,
        orderId: paymentDetails.orderId,
        orderIds: updatedOrderIds,
      },
    });
  };

  const handlePaymentError = (error) => {
    console.error("Payment failed:", error);
    toast.error(error.response?.data?.message || "Payment failed");
    setPaymentStatus((prev) => ({ ...prev, isSuccess: false }));
  };

  const initializeRazorpay = (paymentDetails) => {
    return {
      key: razorpayKey,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      name: "SHREE DEVI SAMBHRAM",
      description: "National Level Technical and Cultural Fest",
      image:
        "https://storage.googleapis.com/educrib/colleges/uploads/f7a1791dd41f3fa5e5e4f8a6faea2467ShreeDeviCollegeOfPhysiotherapy_Fd.jpg",
      order_id: paymentDetails.orderId,
      handler: (response) => handlePaymentSuccess(response, paymentDetails),
      prefill: {
        name: data.name,
        contact: data.mobile,
      },
      notes: {
        address:
          "Shree Devi Institute Of Technology, Kenjar, Near Mangalore International Airport, Karnataka - 574142",
      },
      theme: {
        color: "#0066ff",
      },
      modal: {
        ondismiss: () => toast.info("Payment cancelled"),
      },
    };
  };

  const payNow = async () => {
    try {
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      if (!razorpayKey) {
        throw new Error("Razorpay key not configured");
      }

      const paymentDetails = await sendDatatoBackend();
      const options = initializeRazorpay(paymentDetails);

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", handlePaymentError);
      rzp.open();
      return true;
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to initialize payment"
      );
      return false;
    }
  };

  const resetForm = () => {
    setData({
      name: "",
      email: "",
      college: "",
      branch: "",
      mobile: "",
      Othercollege: "",
      Otherbranch: "",
      teamLeaderName: "",
      teamLeaderEmail: "",
      teamLeaderPhone: "",
      teamLeaderAltPhone: "",
      teamMembers: []
    });
    setEventRegistrations({});
    sessionStorage.removeItem("registrationFormData");
    sessionStorage.removeItem("eventRegistrations");
    setStep(1);
    setSelectedEvent([]);
    setAmount(0);
  };

  const contextValue = {
    eventType,
    setEventType,
    popUpStatus,
    setPopUpStatus,
    selectedEvent,
    setSelectedEvent,
    selectEvent,
    eventDatas,
    setData,
    data,
    setAmount,
    amount,
    sendDatatoBackend,
    payNow,
    step,
    setStep,
    loading,
    paymentStatus,
    resetForm,
    stOrderId,
    setStOrderId,
    eventRegistrations,
    setEventRegistrations,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export default ContextProvider;
