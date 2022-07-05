/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

console.log("API Base URL", API_BASE_URL)

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * 
 * @param {*} params 
 * @param {*} signal 
 * @returns {Promise}
 */
export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * 
 * @param {*} reservation_id 
 * @param {*} signal 
 * @returns {Object}
 */
export async function getReservation(reservation_id, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservation_id}`)
  try {
    return await fetchJson(url, 
      { 
        method: 'GET', 
        headers, 
        signal 
      }, [])
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} newReservation 
 * @param {*} signal 
 * @returns {Object}
 */
export async function createReservation(newReservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`)
  try {
    const response = await fetchJson(url, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({ data: newReservation }),
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} signal 
 * @returns {Object}
 */
export async function listTables(signal) {
  const url = new URL(`${API_BASE_URL}/tables`)
  try {
    const response = await fetchJson(url, {
      method: 'GET',
      headers,
      signal,
    }, [])
    return response
  } catch(error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} newTable 
 * @param {*} signal 
 * @returns {Object}
 */
export async function createTable(newTable, signal) {
  const url = new URL(`${API_BASE_URL}/tables`)
  try {
    const response = await fetchJson(url, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({ data: newTable }),
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} reservationId 
 * @param {*} tableId 
 * @param {*} signal 
 * @returns {Object}
 */
export async function seatTable(reservationId, tableId, signal) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`)
  try {
    const response = await fetchJson(url, {
      method: 'PUT',
      headers,
      signal,
      body: JSON.stringify({ data: { reservation_id: reservationId } })
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} tableId 
 * @returns {Object}
 */
export async function finishTable(tableId) {
  const url = new URL(`${API_BASE_URL}/tables/${tableId}/seat`)
  try {
    const response = await fetchJson(url, {
      method: 'DELETE',
      headers,
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} mobileNumber 
 * @param {*} signal 
 * @returns {Object}
 */
export async function searchByNumber(mobileNumber, signal) {
  const url = new URL(`${API_BASE_URL}/reservations?mobile_number=${mobileNumber}`)
  try {
    const response = await fetchJson(url, {
      method: 'GET',
      headers,
      signal
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} updatedReservation 
 * @param {*} signal 
 * @returns {Object}
 */
export async function updateReservation(updatedReservation, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${updatedReservation.reservation_id}`)
  try {
    const response = await fetchJson(url, {
      method: 'PUT',
      headers,
      signal,
      body: JSON.stringify({ data: { ...updatedReservation } })
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}

/**
 * 
 * @param {*} reservationId 
 * @param {*} newStatus 
 * @param {*} signal 
 * @returns {Object}
 */
export async function updateStatus(reservationId, newStatus, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${reservationId}/status`)
  try {
    const response = await fetchJson(url, {
      method: 'PUT',
      headers,
      signal,
      body: JSON.stringify({ data: { status: newStatus } })
    }, [])
    return response
  } catch (error) {
    console.error(error)
    return error
  }
}



