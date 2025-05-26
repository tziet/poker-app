import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { icons } from "@/constants/icons";
import { useSessionContext } from "@/contexts/SessionContext";
import useSession from "@/hooks/useSession";

const Sessions = () => {
  const { sessions } = useSessionContext();
  const { session: activeSession, loading, error } = useSession();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white">Loading sessions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-red-500">
          Error loading sessions: {error.message}
        </Text>
      </View>
    );
  }

  const renderSessionItem = ({ item }: { item: Session }) => {
    const sessionDate = item?.date?.toDate?.().toLocaleDateString("en-IL", {
      timeZone: "Asia/Jerusalem",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const sessionTime = item?.date?.toDate?.().toLocaleTimeString("en-IL", {
      timeZone: "Asia/Jerusalem",
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <View
        className={`bg-${item.$id === activeSession?.$id ? "green-400" : "white"} rounded-lg shadow-lg p-4 m-2 w-[45%]`}
      >
        <Text className="text-black font-semibold text-center">
          {sessionDate}
        </Text>
        <Text className="text-gray-500 text-center mt-2">{`${sessionTime}${item.$id === activeSession?.$id ? " (Active session)" : ""}`}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-primary" style={{ paddingBottom: 100 }}>
      {/* Logo */}
      <Image
        source={icons.logo}
        className="w-12 h-10 absolute mt-20 mx-auto self-center"
        resizeMode="contain"
        tintColor="white"
      />

      <View className="flex-1 pt-36">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
        >
          <FlatList
            data={sessions}
            renderItem={renderSessionItem}
            keyExtractor={(item) => item?.$id?.toString() || ""}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            className="pb-32"
            contentContainerStyle={{ paddingHorizontal: 10 }}
            ListEmptyComponent={
              <Text className="text-white text-center mt-10">
                No Sessions Found
              </Text>
            }
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default Sessions;
