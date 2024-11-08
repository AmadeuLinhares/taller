import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { v4 as uuidv4 } from 'uuid';
import dayjs, { Dayjs } from "dayjs"

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Transaction ID, Date, Description, Amount (in USD)



type TransactionType = {
  id: string;
  date: Dayjs;
  description: string;
  amount: number
}

type HandleDateProps = {
  value: string;
  isStart: boolean
}

const mock: TransactionType[] = [
  {
    amount: 5,
    date: dayjs(new Date()).add(10, "day"),
    description: "mock-description",
    id: uuidv4(),
  },
  {
    amount: 100,
    date: dayjs(new Date()).add(10, "months"),
    description: "mock-description",
    id: uuidv4(),
  },
  {
    amount: 125.88,
    date: dayjs(new Date()).add(30, "day"),
    description: "mock-description",
    id: uuidv4(),
  },
  {
    amount: 500,
    date: dayjs(new Date()).add(5, "years"),
    description: "mock-description",
    id: uuidv4(),
  },
  {
    amount: 20,
    date: dayjs(new Date()).add(30, "minutes"),
    description: "mock-description",
    id: uuidv4(),
  }
]
function App() {

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, [])

  const fetchData = (simulateError: boolean) => {
    return new Promise<TransactionType[]>((resolve, reject) => {
      setTimeout(() => {
        if (simulateError) {
          reject("Mock return error")
          toast("Ups... Something went wrong", {
            autoClose: 2000,
            type: "error"
          })
          return;
        }
        resolve(mock);
      }, 300);
    });

  }

  const [amounts, setAmounts] = useState<TransactionType[] | []>([])
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  // TODO: add loading


  const getAmounts = async () => {
    try {
      const resp = await fetchData(false)
      if (resp?.length) setAmounts(resp)
    } catch (err) {
      // TODO: error feedback
      setAmounts([])
    }
  }
  useEffect(() => {
    getAmounts()
  }, [])

  const EmptyState = () => {
    return (
      <div style={{ padding: '20px', justifyContent: "center", alignItems: "center" }}>
        <p style={{ fontSize: "22px", fontWeight: 400, }}>No data found</p>
      </div>
    )
  }

  const Card = ({ amount, date, description, id }: TransactionType) => {
    return (
      <div key={id} style={{ display: "flex", padding: '10px', flexDirection: "column", alignItems: "flex-start", border: "solid 1px #EEE" }}>
        {/* Todo: format to USD - Done */}
        <h4>{formatCurrency(amount)}</h4>
        {/* Todo: format Date using some lib - Done */}
        <h6>{date.format("DD/MM/YYYY")}</h6>
        <p>{description}</p>
      </div>
    )
  }

  const render = useMemo(() => {
    // Create empty state
    if (!amounts?.length) return <EmptyState />;

    return amounts.map(amount => <Card {...amount} />)


  }, [amounts])

  const handleDateChange = useCallback(({ isStart, value }: HandleDateProps) => {
    if (isStart) {
      setStartDate(dayjs(value))
      return
    }
    setEndDate(dayjs(value))
  }, [])

  const clear = useCallback(() => {
    setStartDate(null)
    setEndDate(null)
  }, [])

  const onSearch = useCallback(() => {
    if (!startDate) {
      toast("Select a start date", {
        type: "error"
      })
      return
    }
    if (!endDate) {
      toast("Select a end date", {
        type: "error"
      })
      return
    }

    if (endDate.isBefore(startDate)) {
      toast("End date can not be before start date", {
        type: "error"
      })
      return
    }

    const filterData = amounts.filter(val => val.date.isBefore(endDate) && val.date.isAfter(startDate))
    if (filterData?.length) { setAmounts(filterData) } else {
      toast("No date found", {
        type: "error"
      })
      return
    }

  }, [endDate, startDate])

  return (
    <div className='container'>
      <div style={{ justifyContent: "space-between", alignItems: "center", display: "flex" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className='dateField'>
            <input type="date" onChange={(event) => handleDateChange({ isStart: true, value: event.target.value })} />
          </div>
          <div>
            <input type="date" onChange={(event) => handleDateChange({ isStart: false, value: event.target.value })} />
          </div>
        </div>
        <button onClick={onSearch}>Search</button>
        <button onClick={clear}>Clear</button>
      </div>
      <div style={{ display: "grid", rowGap: "8px" }}>
        {render}
      </div>
      <ToastContainer />
    </div>
  )
}

export default App
