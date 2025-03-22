import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { acceptFriendRequest, cancelFriendRequest, getFriends, getIncomingFriendRequests, getMySocialInfo, getOutgoingFriendRequests, getPatientSocialInfo, rejectFriendRequest, removeFriend, sendFriendRequest, SocialInfo } from "../../util/SocialInfo";
import SocialInfoDisplay from "../SocialInfoDisplay";

interface Props {
    setActiveTab(tab: string): void;
}

interface FriendStatus {
    status: "friend" | "pending" | "requested";
    friendRequestId?: number;
}

export default function Community({ setActiveTab }: Props) {
    const auth = useAuth();
    const [validated, setValidated] = useState(false);
    const [patientInfo, setPatientInfo] = useState<Map<number, SocialInfo>>(new Map());
    const [friendTab, setFriendTab] = useState<"friends" | "outgoing" | "incoming">("friends");
    const [friends, setFriends] = useState<SocialInfo[]>([]);
    const [outgoingRequests, setOutgoingRequests] = useState<SocialInfo[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<SocialInfo[]>([]);
    
    const friendStatuses = new Map<number, FriendStatus>();
    friends.forEach((friend) => {
        friendStatuses.set(friend.id, { status: "friend" });
    });
    outgoingRequests.forEach((request) => {
        friendStatuses.set(request.id, { status: "requested", friendRequestId: request.friendRequestId });
    });
    incomingRequests.forEach((request) => {
        friendStatuses.set(request.id, { status: "pending", friendRequestId: request.friendRequestId });
    });

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
        if (validated && patientInfo.size > 0) {
            getFriendList(["friends", "outgoing", "incoming"]);
        }
    }, [validated, patientInfo]);

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

    async function getFriendList(update: Array<"friends" | "outgoing" | "incoming">) {
        if (update.includes("friends")) {
            setFriends((await getFriends(auth)).map((id) => patientInfo.get(id)!));
        }
        if (update.includes("outgoing")) {
            const outgoingFriendRequests = await getOutgoingFriendRequests(auth);
            setOutgoingRequests(outgoingFriendRequests.map((request) => {
                const info = patientInfo.get(request.receiver_id);
                if (info === undefined) {
                    return undefined;
                }
                return {
                    ...info,
                    friendRequestId: request.id,
                };
            }).filter((info) => info !== undefined));
        }
        if (update.includes("incoming")) {
            const incomingFriendRequests = await getIncomingFriendRequests(auth);
            setIncomingRequests(incomingFriendRequests.map((request) => {
                const info = patientInfo.get(request.sender_id);
                if (info === undefined) {
                    return undefined;
                }
                return {
                    ...info,
                    friendRequestId: request.id,
                };
            }).filter((info) => info !== undefined));
        }
    }

    function getFriendButton(id: number, longText: boolean) {
        switch (friendStatuses.get(id)?.status) {
            case "pending":
                return {
                    [longText ? "Accept Friend Request" : "Accept"]:
                        () => acceptFriendRequest(auth, friendStatuses.get(id)!.friendRequestId!).then(() => getFriendList(["incoming", "friends"])),
                    [longText ? "Reject Friend Request" : "Reject"]:
                        () => rejectFriendRequest(auth, friendStatuses.get(id)!.friendRequestId!).then(() => getFriendList(["incoming"])),
                };
            case "requested":
                return {
                    [longText ? "Cancel Friend Request" : "Cancel"]:
                        () => cancelFriendRequest(auth, friendStatuses.get(id)!.friendRequestId!).then(() => getFriendList(["outgoing"])),
                };
            case "friend":
                return {
                    [longText ? "Remove Friend" : "Remove"]:
                        () => removeFriend(auth, id).then(() => getFriendList(["friends"])),
                };
            default:
                return {
                    [longText ? "Send Friend Request" : "Send"]:
                        () => sendFriendRequest(auth, id).then(() => getFriendList(["outgoing"])),
                };
        }
    }

    function getActiveFriendList() {
        switch (friendTab) {
            case "friends":
                return friends;
            case "outgoing":
                return outgoingRequests;
            case "incoming":
                return incomingRequests;
        }
    }

    return (
        <>
            <div className="me-3 w-67">
                {Array.from(patientInfo.values()).map((info) => (
                    <SocialInfoDisplay 
                        key={`patient-${info.id}`} 
                        isFirst={patientInfo.values().next().value?.id === info.id}
                        socialInfo={info} 
                        buttons={getFriendButton(info.id, true)} 
                    />
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
                    {getActiveFriendList().map((info) => (
                        <SocialInfoDisplay 
                            key={`${friendTab}-${info.id}`} 
                            isFirst={getActiveFriendList()[0]?.id === info.id}
                            socialInfo={info} 
                            buttons={getFriendButton(info.id, false)} 
                        />
                    ))}
                </div>
            </div>
        </>
    );
}