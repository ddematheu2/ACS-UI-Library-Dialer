import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {
  CallComposite,
  fromFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter,
  Dialpad,
  DEFAULT_COMPONENT_ICONS
} from '@azure/communication-react';
import React, { useMemo, useState } from 'react';
import { registerIcons, Stack } from '@fluentui/react';
import { text } from 'stream/consumers';

/**
 * Authentication information needed for your client application to use
 * Azure Communication Services.
 *
 * For this quickstart, you can obtain these from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/identity/quick-create-identity
 *
 * In a real application, your backend service would provide these to the client
 * application after the user goes through your authentication flow.
 */
const USER_ID = '';//INSERT USER ID
const TOKEN = '';//INSERT ACCESS TOKEN

/**
 * Display name for the local participant.
 * In a real application, this would be part of the user data that your
 * backend services provides to the client application after the user
 * goes through your authentication flow.
 */
const DISPLAY_NAME = 'David';

/**
 * A phone number created through Communication Services.
 *
 * You can obtain and manage phone numbers from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/telephony/get-phone-number
 *
 */
const ALTERNATE_CALLER_ID = ''; //INSER PHONE NUMBER

/**
 * Entry point of your application.
 */
function App(): JSX.Element {
  // Arguments that would usually be provided by your backend service or
  // (indirectly) by the user.
  const { userId, token, displayName, alternateCallerId } = useAzureCommunicationServiceArgs();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [textFieldValue, setTextFieldValue] = useState('');
  const [recentCalls, setRecentCalls] = useState<string[]>([]);

  // A well-formed token is required to initialize the chat and calling adapters.
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [token]);

  // Memoize arguments to `useAzureCommunicationCallAdapter` so that
  // a new adapter is only created when an argument changes.
  const callAdapterArgs = useMemo(
    () => ({
      userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
      displayName,
      credential,
      alternateCallerId,
      locator: { participantIds : [phoneNumber] }
    }),
    [userId, credential, displayName, alternateCallerId, phoneNumber]
  );

  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);
  callAdapter?.on("callEnded", () => {
    setPhoneNumber('')
  })

  const startCall = () => {
    setPhoneNumber(textFieldValue)
    setRecentCalls(recentCalls => [...recentCalls, textFieldValue])
    setTextFieldValue('')
    console.log(textFieldValue);
  }

  const recentCall = (number:string) => {
    setPhoneNumber(number)
    setRecentCalls(recentCalls => [...recentCalls, number])
  }

  const onChange = (input: string): void => {
    // if there is already a plus sign at the front remove it
    if (input[0] === '+') {
      input = input.slice(1, input.length);
    }
    // add + sign and brackets to format phone number
    if (input.length < 4 && input.length > 0) {
      // store the new value in textFieldValue and pass it back to dialpad textfield
      setTextFieldValue(`+${input}`);
    } else if (input.length >= 4) {
      // store the new value in textFieldValue and pass it back to dialpad textfield
      setTextFieldValue(`+${input}`);
    } else {
      // store the new value in textFieldValue and pass it back to dialpad textfield
      setTextFieldValue(input);
    }
  };

  const recentCallsComponent = () => {
    console.log('render recent')
    return(    
    <Stack>
      {recentCalls.map( number => {
        return(
          <div>
            {number} <button onClick={() => recentCall(number)}> Call</button>
          </div>
          )
      })}
    </Stack>)
  }

  return(
    <div style={{ height: '100vh'}}>
      <div style={{height: '100vh', width: '550px', float:'right'}}>
        <Stack>
        {callAdapter && phoneNumber != '' && <div style={{height:'50vh'}}>
              <CallComposite adapter={callAdapter}/>
            </div>}
            {phoneNumber == '' && <div style={{height:'50vh'}}>
                <Dialpad textFieldValue={textFieldValue} onChange={onChange}/>
                <button onClick={startCall}>Call</button>
              </div>
            }
            <div style={{height:'50vh', backgroundColor: 'lightblue'}}>
              {recentCallsComponent()}
            </div>
        </Stack>
      </div>

    </div>
  );

  if (credential === undefined) {
    return <h3>Failed to construct credential. Provided token is malformed.</h3>;
  }
  return <h3>Initializing...</h3>;
}

/**
 * This hook returns all the arguments required to use the Azure Communication services
 * that would be provided by your backend service after user authentication depending on the user-flow.
 */
function useAzureCommunicationServiceArgs(): {
  userId: string;
  token: string;
  displayName: string;
  alternateCallerId: string;
} {
  return {
    userId: USER_ID,
    token: TOKEN,
    displayName: DISPLAY_NAME,
    alternateCallerId: ALTERNATE_CALLER_ID
  };
}

export default App;
