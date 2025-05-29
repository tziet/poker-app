import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "@/constants/icons";
import { useSessionContext } from "@/contexts/SessionContext";
import useActiveSession from "@/hooks/useSession";
import { updateSession } from "@/services/firebase";
import ConfirmForm from "@/app/components/forms/ConfirmForm";
import React, { useState } from "react";
import ShowModal from "@/app/components/ui/ShowModal";

const Sessions = () => {
  const { sessions } = useSessionContext();
  const {
    session: activeSession,
    loading,
    error,
    refetch,
  } = useActiveSession();
  const { reloadSessions } = useSessionContext(); // Fetch reloadSessions from SessionContext
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [modalState, setModalState] = useState({
    activateSession: false,
  });
  const openModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: true });
  const closeModal = (type: keyof typeof modalState) =>
    setModalState({ ...modalState, [type]: false });

  const handleSessionChange = async (pressedSession: Session) => {
    if (activeSession?.$id !== pressedSession.$id) {
      try {
        if (activeSession) {
          await updateSession(activeSession.$id, {
            ...activeSession,
            isActive: false,
          });
        }
        if (!pressedSession.isActive) {
          await updateSession(pressedSession.$id, {
            ...pressedSession,
            isActive: true,
          });
          closeModal("activateSession");
          alert("Session switched successfully.");
        }
      } catch (error) {
        console.error("Error switching session:", error);
        alert("Failed to switch session. Try again.");
      }
      setSelectedSession(null);
      reloadSessions(); // Update SessionContext
      refetch(); // Refresh session after archiving
    }
  };

  const renderSessionItem = ({ item }: { item: Session }) => {
    const sessionDate = item?.date?.toDate?.().toLocaleDateString("en-IL", {
      timeZone: "Asia/Jerusalem",
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });

    const sessionTime = item?.date?.toDate?.().toLocaleTimeString("en-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <TouchableOpacity
        className={`bg-${item.$id === activeSession?.$id ? "green-400" : "white"} rounded-lg shadow-lg p-4 m-2 w-[45%]`}
        onPress={() => {
          if (item.$id !== activeSession?.$id) {
            openModal("activateSession");
            setSelectedSession(item);
          }
        }}
      >
        <Text className="text-black font-semibold text-center">
          {sessionDate}
        </Text>
        <Text className="text-gray-500 text-center mt-2">{`${sessionTime}${item.$id === activeSession?.$id ? " (Active session)" : ""}`}</Text>
      </TouchableOpacity>
    );
  };

  const renderModals = () => {
    return (
      <ShowModal
        modals={[
          {
            visible: modalState.activateSession,
            form: (
              <ConfirmForm
                onClose={() => closeModal("activateSession")}
                onSubmit={() => handleSessionChange(selectedSession!)}
                submitText="Switch Session"
                text="Are you sure you want to switch to this session?"
              />
            ),
          },
        ]}
      />
    );
  };

  return (
    <View className="flex-1 bg-primary" style={{ paddingBottom: 100 }}>
      <Image
        source={icons.logo}
        className="w-12 h-10 absolute mt-20 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          className="flex-1 self-center justify-center"
        />
      ) : error ? (
        <View className="flex-1 justify-center items-center bg-primary">
          <Text className="text-red-500">
            Error loading sessions: {error.message}
          </Text>
        </View>
      ) : (
        <View className="flex-1 pt-36">
          <FlatList
            className="px-5"
            data={sessions}
            keyExtractor={(item) => item?.$id.toString()}
            renderItem={renderSessionItem}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 16,
              marginVertical: 16,
            }}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
            ListEmptyComponent={
              !loading && !error ? (
                <View className="mt-10 px-5">
                  <Text className="text-white text-center mt-10">
                    No Sessions Found
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}
      {renderModals()}
    </View>
  );
};

export default Sessions;
