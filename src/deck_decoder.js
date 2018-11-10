
const CArtifactDeckDecoder = (() => {
  const $s_nCurrentVersion = 2;
  const $sm_rgchEncodedPrefix = "ADC";

  const ParseDeck = ($strDeckCode) => {
    let $deckBytes = DecodeDeckString( $strDeckCode );
    if( !$deckBytes ) return false;
    let $deck = ParseDeckInternal( $strDeckCode, $deckBytes );
    return $deck;
  }

  const RawDeckBytes = ($strDeckCode) => {
  }

  const DecodeDeckString = ($strDeckCode) => {
    if ($strDeckCode.substring( 0, $sm_rgchEncodedPrefix.length) != $sm_rgchEncodedPrefix) {
      return false;
    }

    let $strNoPrefix = $strDeckCode.substring($sm_rgchEncodedPrefix.length)
    $strNoPrefix = $strNoPrefix.replace(/-/g,"/")
    $strNoPrefix = $strNoPrefix.replace(/_/g,"=")
    let $decoded = window.atob($strNoPrefix)//base64_decode( $strNoPrefix );
    //console.log($decoded)
    let $deckBytes = []
    for (var i = 0; i < $decoded.length; i++) {
      $deckBytes.push($decoded.charCodeAt(i)) //.toString(2)

    }
    // console.log($deckBytes)
    return $deckBytes
  }

  //&$nOutBits
  const ReadBitsChunk = ($nChunk, $nNumBits, $nCurrShift, $nOutBits) => 	{
		let $nContinueBit = ( 1 << $nNumBits );
		let $nNewBits = $nChunk & ( $nContinueBit - 1 );
		$nOutBits[0] |= ( $nNewBits << $nCurrShift );
    //console.log($nOutBits)
		return ( $nChunk & $nContinueBit ) != 0;
	}

  //&$indexStart , &$outValue
  const ReadVarEncodedUint32 = ( $nBaseValue, $nBaseBits, $data, $indexStart, $indexEnd, $outValue ) =>{
    $outValue[0] = 0;
    let $nDeltaShift = 0;
    if ( ( $nBaseBits == 0 ) || ReadBitsChunk( $nBaseValue, $nBaseBits, $nDeltaShift, $outValue ) )
    {
      $nDeltaShift += $nBaseBits;
      while ( 1 )
      {
        //do we have more room?
        if ( $indexStart[0] > $indexEnd )
          return false;
        //read the bits from this next byte and see if we are done
        let $nNextByte = $data[$indexStart[0]++];
        if ( !ReadBitsChunk( $nNextByte, 7, $nDeltaShift, $outValue ) )
          break;
        $nDeltaShift += 7;
      }
    }
    return true;
  }

  // &$indexStart, &$nPrevCardBase, &$nOutCount, &$nOutCardID
  const ReadSerializedCard = ( $data, $indexStart, $indexEnd, $nPrevCardBase, $nOutCount, $nOutCardID ) => {
		//end of the memory block?

		if( $indexStart[0] > $indexEnd )
			return false;
		//header contains the count (2 bits), a continue flag, and 5 bits of offset data. If we have 11 for the count bits we have the count
		//encoded after the offset
		let $nHeader = $data[$indexStart[0]++];
    // console.log($indexStart[0], $indexEnd)
    //console.log(( $nHeader))
		let $bHasExtendedCount = ( ( $nHeader >> 6 ) == 0x03 );
		//read in the delta, which has 5 bits in the header, then additional bytes while the value is set
		let $nCardDelta = [0];
  //  console.log($indexStart[0]);
		if ( !ReadVarEncodedUint32( $nHeader, 5, $data, $indexStart, $indexEnd, $nCardDelta ) ) return false;
  //  console.log($indexStart[0], "-----");
		$nOutCardID[0] = $nPrevCardBase[0] + $nCardDelta[0];
		//now parse the count if we have an extended count
		if ( $bHasExtendedCount ){
			if ( !ReadVarEncodedUint32( 0, 0, $data, $indexStart, $indexEnd, $nOutCount ) )
				return false;
		} else {
			//the count is just the upper two bits + 1 (since we don't encode zero)
			$nOutCount[0] = ( $nHeader >> 6 ) + 1;
		}
    // console.log(( $indexStart))
		//update our previous card before we do the remap, since it was encoded without the remap
		$nPrevCardBase[0] = $nOutCardID[0];

		return true;
	}

  const ParseDeckInternal = ( $strDeckCode, $deckBytes ) => {
		let $nCurrentByteIndex = [0];
		let $nTotalBytes = $deckBytes.length;
		//check version num
		let $nVersionAndHeroes = $deckBytes[$nCurrentByteIndex[0]++];
		let $version = $nVersionAndHeroes >> 4;


		if( $s_nCurrentVersion != $version && $version != 1 ) return false;

		//do checksum check
		let $nChecksum = $deckBytes[$nCurrentByteIndex[0]++];
		let $nStringLength = 0;
		if( $version > 1)
			$nStringLength = $deckBytes[$nCurrentByteIndex[0]++];
		let $nTotalCardBytes = $nTotalBytes - $nStringLength;
		//grab the string size
		//{
			let $nComputedChecksum = 0;
			for( let $i = $nCurrentByteIndex[0]; $i < $nTotalCardBytes; $i++ )
				$nComputedChecksum += $deckBytes[$i];
			let $masked = ($nComputedChecksum & 0xFF);
			if( $nChecksum != $masked ) return false;
		//}
		//read in our hero count (part of the bits are in the version, but we can overflow bits here
		let $nNumHeroes = [0];
		if ( !ReadVarEncodedUint32( $nVersionAndHeroes, 3, $deckBytes, $nCurrentByteIndex, $nTotalCardBytes, $nNumHeroes ) )
			return false;
		//now read in the heroes
		let $heroes = [];
		//{
			let $nPrevCardBase = [0];

			for( let $nCurrHero = 0; $nCurrHero < $nNumHeroes[0]; $nCurrHero++ )
			{
        // console.log($nCurrentByteIndex)
				let $nHeroTurn = [0];
				let $nHeroCardID = [0];
        //$data, &$indexStart, $indexEnd, &$nPrevCardBase, &$nOutCount, &$nOutCardID
				if( !ReadSerializedCard( $deckBytes, $nCurrentByteIndex, $nTotalCardBytes, $nPrevCardBase, $nHeroTurn, $nHeroCardID ) )
				{
					return false;
				}
        // console.log($nCurrentByteIndex , " ------ ")
        //console.log($nCurrentByteIndex, $nTotalCardBytes, $nPrevCardBase, $nHeroTurn, $nHeroCardID)
				//array_push( $heroes, array("id" => $nHeroCardID[0], "turn" => $nHeroTurn[0]) );
        $heroes.push({"id" : $nHeroCardID[0],"turn" : $nHeroTurn[0]})
			}
		//}
		let $cards = [];
		$nPrevCardBase[0] = 0;
		while( $nCurrentByteIndex[0] <= $nTotalCardBytes )
		{
			let $nCardCount = [0];
			let $nCardID = [0];
			if( !ReadSerializedCard( $deckBytes, $nCurrentByteIndex, $nTotalBytes, $nPrevCardBase, $nCardCount, $nCardID ) )
				return false;
			//array_push( $cards, array("id" => $nCardID[0], "count" => $nCardCount[0]) );
      $cards.push({"id" : $nCardID[0],"count" : $nCardCount[0]})
		}
		let $name = "";
		if( $nCurrentByteIndex[0] <= $nTotalBytes )
		{
			//$bytes = array_slice($deckBytes, -1 * $nStringLength);
      let $bytes = $deckBytes.slice( -1 * $nStringLength);
      $name = $bytes
			//$name = implode(array_map("chr", $bytes));
			// replace strip_tags with an HTML sanitizer or escaper as needed.
			//$name = strip_tags( $name );
		}
		//return array("heroes" => $heroes, "cards" => $cards, "name" => $name);
    return {"heroes" : $heroes, "cards" : $cards, "name" : $name}
	}


  return {DecodeDeckString,ParseDeck}
})();

export default CArtifactDeckDecoder;
