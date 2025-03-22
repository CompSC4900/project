import { SocialInfo } from "../util/SocialInfo";

interface Props {
    isFirst: boolean;
    socialInfo: SocialInfo;
}

export default function SocialInfoDisplay({ isFirst, socialInfo }: Props) {
    return (
        <>
            {isFirst && <hr />}
            <div className="d-flex flex-row">
                <img src={socialInfo.profilePicture} alt="Profile" className="rounded-circle me-3" />
                <div>
                    <h5>{socialInfo.id}</h5>
                </div>
            </div>
            <hr />
        </>
    );
}