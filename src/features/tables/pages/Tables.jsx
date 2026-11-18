import { useEffect, useState } from "react";
// import axios from "axios";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormField from "../../../components/common/FormField";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import Cookies from 'js-cookie'

const API = "http://127.0.0.1:8000";

const OPEN_HOUR = 10;
const CLOSE_HOUR = 22;
const SLOT_HOURS = 1;

const pad = (n) => String(n).padStart(2, "0");

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const SLOTS = [];
for (let h = OPEN_HOUR; h + SLOT_HOURS <= CLOSE_HOUR; h += SLOT_HOURS) {
  SLOTS.push({ start: h, end: h + SLOT_HOURS, label: `${pad(h)}:00 - ${pad(h + SLOT_HOURS)}:00` });
}

const toISO = (date, hour) => `${date}T${pad(hour)}:00:00`;

const authHeader = () => ({
  headers: { Authorization: `Bearer ${Cookies.get("token")}` },
});

const getError = (err, fallback) => {
  const d = err.response?.data;
  return d?.error?.message || (typeof d?.detail === "string" ? d.detail : null) || fallback;
};

const getStatus = (r) => {
  if (r.cancelled_at) return "Cancelled";
  if (new Date(r.end_time) < new Date()) return "Completed";
  if (new Date(r.reserved_for_time) <= new Date()) return "Ongoing";
  return "Upcoming";
};

const Tables = () => {
  const [date, setDate] = useState(todayStr());
  const [persons, setPersons] = useState("");
  const [slot, setSlot] = useState(null);

  const [freeTables, setFreeTables] = useState(null); 
  const [myReservations, setMyReservations] = useState([]);
  const [tab, setTab] = useState("book");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const fetchMine = async () => {
    try {
      const res = await axios.get(`${API}/customer/myreservations`, authHeader());
      setMyReservations(res.data.data || []);
    } catch (err) {
      console.error("Error fetching reservations:", err);
    }
  };

  useEffect(() => {
    fetchMine();
  }, []);

  const loadFree = async () => {
    const res = await axios.get(`${API}/customer/availabletables`, {
      params: {
        start_time: toISO(date, slot.start),
        end_time: toISO(date, slot.end),
        persons: Number(persons),
      },
      ...authHeader(),
    });
    setFreeTables(res.data.data || []);
  };

  const findTables = async () => {
    if (!persons || Number(persons) < 1) {
      setMessage({ text: "Please enter number of persons.", type: "error" });
      return;
    }
    if (!slot) {
      setMessage({ text: "Please select a time slot.", type: "error" });
      return;
    }
    try {
      setLoading(true);
      setMessage({ text: "", type: "" });
      setTab("book");
      await loadFree();
    } catch (err) {
      setMessage({ text: getError(err, "Could not check availability."), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const reserve = async (tableId) => {
    try {
      setLoading(true);
      await axios.post(
        `${API}/customer/reservetable/${tableId}`,
        {
          total_person: Number(persons),
          reserved_for_time: toISO(date, slot.start),
          end_time: toISO(date, slot.end),
        },
        authHeader()
      );
      setMessage({ text: "Table reserved successfully!", type: "success" });
      fetchMine();
    } catch (err) {
      setMessage({ text: getError(err, "Failed to book reservation."), type: "error" });
    } finally {
      try { await loadFree(); } catch (e) { console.error(e); }
      setLoading(false);
    }
  };

  const cancel = async (reservationId) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await axios.patch(`${API}/customer/cancelreservation/${reservationId}`, {}, authHeader());
      setMessage({ text: "Reservation cancelled.", type: "success" });
      fetchMine();
      if (freeTables) loadFree();
    } catch (err) {
      setMessage({ text: getError(err, "Could not cancel reservation."), type: "error" });
    }
  };

  const onDateChange = (e) => { setDate(e.target.value); setSlot(null); setFreeTables(null); };
  const onPersonsChange = (e) => { setPersons(e.target.value); setFreeTables(null); };
  const onSlotClick = (s) => { setSlot(s); setFreeTables(null); };

  const isPast = (s) => new Date(toISO(date, s.start)) <= new Date();

  const left = (
    <Panel title="Reserve a Table" subtitle="Step 1: choose date, persons and time slot" className="w-100">
      <AlertMessage message={message} />

      <FormField label="Date:" id="date" type="date" min={todayStr()} value={date} onChange={onDateChange} required />
      <FormField label="Persons:" id="persons" type="number" min="1" value={persons} onChange={onPersonsChange} placeholder="e.g. 4" required />

      <label className="form-label small fw-semibold text-secondary">Time Slot:</label>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {SLOTS.map((s) => (
          <button
            key={s.start}
            type="button"
            disabled={isPast(s)}
            onClick={() => onSlotClick(s)}
            className={`btn btn-sm ${slot?.start === s.start ? "btn-dark" : "btn-outline-secondary"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button type="button" onClick={findTables} disabled={loading} className="btn btn-dark w-100 fw-semibold border-0 shadow-sm">
        {loading ? "Please wait..." : "Find Free Tables"}
      </button>
    </Panel>
  );

  const right = (
    <Panel className="h-100 d-flex flex-column overflow-hidden">
      <div className="d-flex gap-2 mb-3">
        <button type="button" onClick={() => setTab("book")} className={`btn btn-sm ${tab === "book" ? "btn-dark" : "btn-outline-secondary"}`}>
          Free Tables
        </button>
        <button type="button" onClick={() => setTab("mine")} className={`btn btn-sm ${tab === "mine" ? "btn-dark" : "btn-outline-secondary"}`}>
          My Reservations ({myReservations.length})
        </button>
      </div>

      <ScrollArea>
        {tab === "book" && (
          freeTables === null ? (
            <EmptyState variant="box" text="Select a date, persons and time slot, then click 'Find Free Tables'." />
          ) : freeTables.length === 0 ? (
            <EmptyState variant="box" text="No free tables for this slot. Try another time slot." />
          ) : (
            <div className="d-flex flex-column gap-3">
              <p className="text-muted small mb-0">
                Free on <strong>{date}</strong>, <strong>{slot.label}</strong> for <strong>{persons}</strong> person(s):
              </p>
              {freeTables.map((t) => (
                <div key={t.table_id} className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center gap-3">
                  <div className="text-dark small">
                    <strong className="text-dark d-block mb-1 fs-6">Table {t.table_number}</strong>
                    <span className="text-muted opacity-75">
                      Capacity: <strong className="text-dark fw-semibold">{t.capacity} Seats</strong>
                    </span>
                  </div>
                  <button type="button" onClick={() => reserve(t.table_id)} disabled={loading} className="btn btn-sm btn-dark rounded-2 px-3 fw-semibold shadow-sm flex-shrink-0">
                    Reserve
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "mine" && (
          myReservations.length === 0 ? (
            <EmptyState variant="box" text="You have no reservations yet." />
          ) : (
            <div className="d-flex flex-column gap-3">
              {myReservations.map((r) => {
                const status = getStatus(r);
                return (
                  <div key={r.reservation_id} className="p-3 bg-light border-0 rounded-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
                    <div className="text-dark small">
                      <strong className="text-dark d-block mb-1 fs-6">
                        Table {r.table_number} · {r.total_person} person(s)
                      </strong>
                      <span className="text-muted d-block">
                        {new Date(r.reserved_for_time).toLocaleString()} → {new Date(r.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <StatusBadge active={status === "Upcoming" || status === "Ongoing"}>{status}</StatusBadge>
                      {status === "Upcoming" && (
                        <button type="button" onClick={() => cancel(r.reservation_id)} className="btn btn-sm btn-outline-danger rounded-2 fw-semibold">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </ScrollArea>
    </Panel>
  );

  return <SplitLayout left={left} right={right} />;
};

export default Tables;

