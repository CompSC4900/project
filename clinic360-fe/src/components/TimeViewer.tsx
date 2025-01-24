import { Fragment, ReactNode } from "react"

interface TimeInfo {
    time: Date
    content: ReactNode
}

interface Props {
    times: TimeInfo[]
}

export default function TimeViewer({times}: Props) {
    return (
        <div className="bg-body-tertiary rounded p-2">
            {times.map((time, i) => (
                <Fragment key={time.time.getTime()}>
                    <div className="d-flex align-items-center">
                        <b className="me-2">{time.time.toLocaleTimeString()}</b>
                        {time.content}
                    </div>
                    {i !== times.length - 1 && <hr />}
                </Fragment>
            ))}
        </div>
    );
}