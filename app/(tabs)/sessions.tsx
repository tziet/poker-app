import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import React, { useCallback, useState, useEffect } from "react";
import { images } from "@/app/constants/images";
import { icons } from "@/app/constants/icons";
import SearchBar from "@/app/components/SearchBar";
import { useRouter } from "expo-router";
import useFetch from "@/app/services/useFetch";
import { getActiveSession, getAllSessions } from "@/app/services/firebase";
import { useSessionContext } from "@/app/contexts/SessionContext";

export default function Sessions() {
  const router = useRouter();
  const { sessions } = useSessionContext();

  // const {
  //   data: movies,
  //   loading: moviesLoading,
  //   error: moviesError,
  // } = useFetch(() => fetchMovies({ query: "" }));

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
          {/*{moviesLoading ? (*/}
          {/*  <ActivityIndicator*/}
          {/*    size="large"*/}
          {/*    color="#0000ff"*/}
          {/*    className="mt-10 self-center"*/}
          {/*  />*/}
          {/*) : moviesError ? (*/}
          {/*  <Text>Error: {moviesError?.message}</Text>*/}
          {/*) : (*/}
          {/*  <View className="flex-1 mt-5">*/}
          {/*    <SearchBar*/}
          {/*      onPress={() => router.push("/profile")}*/}
          {/*      placeholder="Search for something"*/}
          {/*    />*/}
          {/*    <>*/}
          {/*      <Text className="text-ig text-white font-bold mt-5 mb-3">*/}
          {/*        Latest Movies*/}
          {/*      </Text>*/}
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
          {/*    </>*/}
          {/*  </View>*/}
          {/*)}*/}
        </ScrollView>
      </View>
    </>
  );
}
