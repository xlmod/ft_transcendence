import { useState } from "react";

import { iaxios } from "../../utils/axios";
import {  } from '../utils/requester';

import { Button } from "../utils/button";

import './edit_settings.css'

interface IProps {
	close :( update :boolean ) => void,
}

export function EditSettings ( props :IProps ) {

	return (
		<section id="edit-settings-section">
			<div id="edit-settings-wall">
			</div>
			<div id="edit-settings-window">
				<ul>

				</ul>
				<div id="edit-settings-button">
					<Button id="edit-settings-button-cancel"
						value="close" fontSize={0.8} onClick={() => {props.close(false)}} />
				</div>
			</div>
		</section>
	);

}
