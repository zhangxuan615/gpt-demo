import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import RecemtConverstaions from "./RecentConversations";
import CalendarInfo from "./CalerdarInfo";
import { postData } from "@/services";
import { mockedInfo } from "../mocked-data";
import { ChatGptResponseType, DataType } from "./index.interface";
import Chat from "./Chat";

import styles from "./index.less";

const FhlChatGpt: FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [data, setData] = useState<DataType>({});
  const [popSuggestionsData, setPopSuggestionsData] = useState<string[]>([]);

  const username = useMemo(() => data.userMe?.name, [data.userMe?.name]);

  const getResponseFromChatGpt = useCallback(async (newData: DataType) => {
    try {
      const res = await postData("http://localhost:5002/test-demo", newData);
      const resData = res.data as ChatGptResponseType;
      if (resData?.message && resData?.message?.name) {
        const dataCopy = { ...newData };
        if (!dataCopy.recentConversations?.[0]) {
          dataCopy.recentConversations = [[]];
        }

        dataCopy.recentConversations[0]?.push(resData.message);
        setData(dataCopy);
      }

      if (!!resData?.smartReply?.length) {
        setTimeout(() => setPopSuggestionsData(resData.smartReply ?? []), 1000);
      }
    } catch (err) {
      messageApi.open({
        type: "error",
        content: `${err}`,
        duration: 2
      });
    }
  }, [messageApi]);

  const handleOnChange = useCallback(
    (newData: DataType) => {
      setData(newData);
      setPopSuggestionsData([]);
      getResponseFromChatGpt(newData);
    },
    [getResponseFromChatGpt]
  );

  const handleSmartReplyClick = useCallback(() => {
    setPopSuggestionsData([]);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setData(mockedInfo);
    }, 500);
  }, []);

  if (!username) {
    return null;
  }

  return (
    <div className={styles.container}>
      {contextHolder}
      <div className={styles.chatContainer}>
        <Chat
          data={data}
          popSuggestionsData={popSuggestionsData}
          onChange={handleOnChange}
          onSmartReplyClick={handleSmartReplyClick}
        />
      </div>
      <div className={styles.messageContainer}>
        <RecemtConverstaions username={username} data={data} onChange={handleOnChange} />
      </div>
      <div className={styles.otherInfo}>
        <CalendarInfo data={data} onChange={handleOnChange} />
      </div>
    </div>
  );
};

export default FhlChatGpt;
