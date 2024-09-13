import { Box, Spinner, Text } from "@chakra-ui/react";
import React from "react";

const ChatLoading = () => {
    return (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
            <Spinner size="xl" w={20} h={20} margin="auto" />
            <Text fontSize="xl" ml={4}>
                Loading chats...
            </Text>
        </Box>
    );
};

export default ChatLoading;
