import React from "react";
import { View, Modal } from "react-native";

type ShowModalProps = {
  modals: {
    visible: boolean;
    form: React.ReactNode;
  }[];
};

const ShowModal = ({ modals }: ShowModalProps) => {
  return (
    <>
      {modals.map((modal, index) => (
        <Modal
          key={index}
          visible={modal.visible}
          transparent
          animationType="slide"
        >
          <View className="flex-1 justify-center items-center bg-black/60">
            {modal.form}
          </View>
        </Modal>
      ))}
    </>
  );
};

export default ShowModal;
