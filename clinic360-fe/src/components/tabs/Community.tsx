import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { getFriends, getIncomingFriendRequests, getMySocialInfo, getOutgoingFriendRequests, getPatientSocialInfo, SocialInfo } from "../../util/SocialInfo";
import SocialInfoDisplay from "../SocialInfoDisplay";

interface Props {
    setActiveTab(tab: string): void;
}

export default function Community({ setActiveTab }: Props) {
    const auth = useAuth();
    const [validated, setValidated] = useState(false);
    const [patientInfo, setPatientInfo] = useState<Map<number, SocialInfo>>(new Map());
    const [friendTab, setFriendTab] = useState<"friends" | "outgoing" | "incoming">("friends");
    const [friends, setFriends] = useState<SocialInfo[]>([]);
    useEffect(() => {
        (async () => {
            const mySocialInfo = await getMySocialInfo(auth);
            if (mySocialInfo.length === 0) {
                return;
            }
            setValidated(true);
            const rawPatientInfo = await getPatientSocialInfo(auth);
            const patientInfo = new Map(rawPatientInfo.map((info) => [info.id, info]));
            patientInfo.delete(mySocialInfo[0].id);
            setPatientInfo(patientInfo);
        })();
    }, []);

    useEffect(() => {
        if (validated) {
            (async () => {
                const friendList = await getFriendList();
                setFriends(friendList);
            })();
        }
    }, [validated, friendTab]);

    if (!validated) {
        return (
            <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
                <button className="btn btn-primary" onClick={() => {
                    setActiveTab("profile"); // TODO: make sure this is correct
                }}>
                    Please Set Up Your Profile
                </button>
            </div>
        );
    }

    async function getFriendList() {
        switch (friendTab) {
            case "friends":
                return await getFriends(auth);
            case "outgoing":
                const outgoingFriendRequests = await getOutgoingFriendRequests(auth);
                return outgoingFriendRequests.map((request) => patientInfo.get(request.receiver)).filter((info) => info !== undefined);
            case "incoming":
                const incomingFriendRequests = await getIncomingFriendRequests(auth);
                return incomingFriendRequests.map((request) => patientInfo.get(request.sender)).filter((info) => info !== undefined);
        }
    }
    return (
        <>
            <div className="me-3 w-67">
                {Array.from(patientInfo.values()).map((info, index) => (
                    <SocialInfoDisplay key={info.id} isFirst={index === 0} socialInfo={info} />
                ))}
            </div>
            <div className="card w-33">
                <div className="card-header">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${friendTab === "friends" ? "active" : ""}`}
                                onClick={() => setFriendTab("friends")}
                            >
                                Friends
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${friendTab === "outgoing" ? "active" : ""}`}
                                onClick={() => setFriendTab("outgoing")}
                            >
                                Outgoing Requests
                            </button>
                        </li>
                        <li className="nav-item">
                            <button 
                                className={`nav-link ${friendTab === "incoming" ? "active" : ""}`}
                                onClick={() => setFriendTab("incoming")}
                            >
                                Incoming Requests
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    {friends.map((info, index) => (
                        <SocialInfoDisplay key={info.id} isFirst={index === 0} socialInfo={info} />
                    ))}
                </div>
            </div>
        </>
    );
}