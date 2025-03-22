import { SocialInfo } from "../util/SocialInfo";

interface Props {
    isFirst: boolean;
    socialInfo: SocialInfo;
    buttons: Record<string, VoidFunction>;
}

export default function SocialInfoDisplay({ isFirst, socialInfo, buttons }: Props) {
    return (
        <>
            {isFirst && <hr />}
            <div className="d-flex flex-row align-items-center">
                <img src={socialInfo.profile_picture ?? "/dummy-pfp.png"} width={50} height={50} alt="Profile" className="rounded-circle me-3" />
                <h5 className="mb-0 me-3">{socialInfo.first_name} {socialInfo.last_name}</h5>
                {Array.from(Object.entries(buttons)).map(([text, callback], index) => (
                    <button key={text} className={`btn btn-primary me-2 ${index === 0 ? "ms-auto" : ""}`} onClick={callback}>{text}</button>
                ))}
            </div>
            <hr />
        </>
    );
}