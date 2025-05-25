import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { icons } from "@/app/constants/icons";
import { useSessionContext } from "@/app/contexts/SessionContext";

const Sessions = () => {
  const { sessions } = useSessionContext();

  return (
    <>
      <View className="flex-1 bg-primary">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        >
          <Image
            source={icons.logo}
            className="w-12 h-10 mt-20 mx-auto self-center z-50"
            resizeMode="contain"
            tintColor="white"
          />
          <FlatList
            data={sessions}
            renderItem={({ item }) => (
              <View>
                <Text className="text-white">
                  {item?.date.toDate().toLocaleString("en-IL", {
                    timeZone: "Asia/Jerusalem",
                    month: "numeric",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item?.$id?.toString() ?? ""}
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "flex-start",
              gap: 80,
              paddingRight: 30,
              paddingLeft: 30,
              marginBottom: 80,
              paddingTop: 50,
            }}
            className="mt-2 pb-32"
            scrollEnabled={false}
          ></FlatList>
        </ScrollView>
      </View>
    </>
  );
};

export default Sessions;
