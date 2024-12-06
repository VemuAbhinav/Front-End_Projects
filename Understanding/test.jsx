import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchUniversitiesId } from "src/api/UniversityApi/fetchUniversityId";
import LoaderCircle from "src/components/CircularLoading/loader";
import Toast from "src/components/ShowToast/toastHandler";
import { useSession } from "src/Context/AuthProvider.jsx";
import { updateUniversity } from "src/api/UniversityApi/updateUniversity.jsx";
import LoadingButton from "src/components/LoadingButton/loadingbutton.jsx";
import { deleteUniversityById } from "src/api/UniversityApi/deleteUniversity.jsx";
import { deleteCourseById } from "src/api/Courses/deleteCourse.jsx";
import { getCountries } from "src/Context/Countries.jsx";
import { EditUniversity } from "src/components/editUniversity/editUniversity.jsx";
import { CiSettings } from "react-icons/ci";
import { Helmet } from "react-helmet-async";
import { fetchUniversities } from "src/api/UniversityApi/fetchUniversities";
import "./Universities/Universities.css";
import { FaTrashAlt } from "react-icons/fa";
import useSWR from "swr";
import api from "src/api";
import { MdKeyboardArrowDown } from "react-icons/md";
const getFetcher = (url) => api.get(url).then((res) => res.data);

export default function AboutUniversity() {
	const { universityId } = useParams();
	const [toastHandler, setToastHandler] = useState(false);
	const [toastData, setToastData] = useState({
		description: "",
		type: "error",
	});
	const [savingUniversityStarted, setSavingUniversityStarted] = useState(false);
	const [deletingUniversityStarted, setdeletingUniversityStarted] =
		useState(false);
	const [is_admin, setIsAdmin] = useState(false);
	const [deletingCourseStarted, setDeletingCourseStarted] = useState(false);
	const [loggedInUser, setLoggedInUser] = useState(false);
	const [universityDetails, setUniversityDetails] = useState({
		id: 0,
		name: "",
		universityLogo: "",
		about: "",
		eligibility: [],
		availablePrograms: [],
		address: "",
		country: "",
	});
	const [newImage, setNewImage] = useState(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const navigate = useNavigate();
	const session = useSession();
	useEffect(() => {
		if (session.session.authenticated) {
			setLoggedInUser(true);
			if (session.session.is_admin) {
				setIsAdmin(true);
			}
		}
	}, [session]);
	const handleUniversityDeletion = async (id) => {
		const res = await deleteUniversityById(id);
		if (res.status === "success") {
			navigate("/dashboard/universities");
		} else {
			setToastHandler(true);
			setToastData({
				description: "Failed to delete university",
				type: "error",
			});
		}
		setdeletingUniversityStarted(false);
	};
	const handleCourseDeletion = async (id) => {
		const res = await deleteCourseById(id);
		console.log(res);
		if (res.status === "success") {
			navigate("/dashboard/universities");
		} else {
			setToastHandler(true);
			setToastData({
				description: "Failed to delete course",
				type: "error",
			});
		}
		setDeletingCourseStarted(false);
	};
	useEffect(() => {
		const fetchData = async () => {
			const data = await fetchUniversitiesId(universityId);
			if (data.status === "error") {
				setToastHandler(true);
				setToastData({
					description: data.error,
					type: "error",
				});
			} else {
				if (data.data.length === 0) {
					setToastHandler(true);
					setToastData({
						description: "No data found for this university",
						type: "error",
					});
					return;
				}
				if (data.data.returned_object === "university") {
					console.log(data);
					setUniversityDetails({
						id: data.data.results[0].university_id,
						name: data.data.results[0].university_name,
						universityLogo: data.data.results[0].university_image,
						about: data.data.results[0].university_about,
						eligibility: data.data.results[0].university_eligibility
							? data.data.results[0].university_eligibility.split("#")
							: [],
						availablePrograms: [],
						address: data.data.results[0].university_abstract_address,
						country: data.data.results[0].university_country.country_name,
					});
				} else {
					let courses = [];
					let coursesData = data.data.data;
					for (let i = 0; i < coursesData.length; i++) {
						courses.push({
							id: coursesData[i].id,
							course_name: coursesData[i].course_name,
							course_fee: coursesData[i].course_fee,
							course_duration: coursesData[i].course_duration,
							course_certificate: coursesData[i].course_certificate,
							course_image: coursesData[i].course_image,
						});
					}
					setUniversityDetails({
						id: coursesData[0].course_university.id,
						name: coursesData[0].course_university.university_name,
						universityLogo: coursesData[0].course_university.university_image,
						about: coursesData[0].course_university.university_about,
						country:
							data.data.data[0].course_university.university_country
								.country_name,

						eligibility:
							coursesData[0].course_university.university_eligibility !== null
								? coursesData[0].course_university.university_eligibility.split(
										"#"
									)
								: [],
						availablePrograms: courses,
						address:
							coursesData[0].course_university.university_abstract_address,
					});
				}
			}
		};
		fetchData();
	}, [universityId]);
	const {
		data: admissionProcessData,
		error: admissionProcessError,
		isLoading: admissionProcessLoading,
	} = useSWR(`/api/admissionprocess?university_id=${universityId}`, getFetcher);
	const {
		data: documentsData,
		error: documentsError,
		isLoading: documentsLoading,
	} = useSWR(
		`/api/documentsrequired?university_id=${universityId}`,
		getFetcher
	);
	const {
		data: feeStructureData,
		error: feeStructureError,
		isLoading: feeStructureLoading,
	} = useSWR(`/api/feestructure?university_id=${universityId}`, getFetcher);
	const {
		data: faqsData,
		error: faqsError,
		isLoading: faqsLoading,
	} = useSWR(`/api/faqs?university_id=${universityId}`, getFetcher);
	const {
		data: sectionData,
		error: sectionError,
		isLoading: sectionLoading,
	} = useSWR(`/api/section?university_id=${universityId}`, getFetcher);

	const handleEditClick = async () => {
		if (!isEditMode) {
			setIsEditMode(true);
		}
		if (isEditMode) {
			setSavingUniversityStarted(true);
			console.log(universityDetails.eligibility);
			const formData = new FormData();
			formData.append("university_name", universityDetails.name);
			formData.append("university_country", universityDetails.country);
			formData.append("university_about", universityDetails.about);
			if (newImage) {
				console.log(universityDetails.universityLogo);
				formData.append("university_image", newImage);
			}
			formData.append("university_abstract_address", universityDetails.address);
			formData.append(
				"university_eligibility",
				universityDetails.eligibility.join("#")
			);
			const res = await updateUniversity(formData, universityId);
			console.log(res.status);
			if (res.status !== "success") {
				setToastHandler(true);
				setToastData({
					description: "Something happened",
					type: "error",
				});
			} else {
				setToastHandler(true);
				setToastData({
					description: "University details has been update successfully",
					type: "success",
				});
			}
			setIsEditMode(false);
			setSavingUniversityStarted(false);
		}
	};

	const handleInputChange = (e, field) => {
		setIsEditMode(true);
		setUniversityDetails({
			...universityDetails,
			[field]: field === "universityLogo" ? e.target.files[0] : e.target.value,
		});
	};
	const [showDropDown, setShowDropdown] = useState(false);
	const [URLSearchParams] = useSearchParams();

	const country = URLSearchParams.get("country") || "India";
	const [currentPage, setCurrentPage] = useState(1);
	const [universities, setUniversities] = useState(null);
	const [buttonClicked, setButtonClicked] = useState(false);
	const [lastPage, setLastPage] = useState(false);

	// New state variables with correct types
	const [eligibility, setEligibility] = useState([]);
	const [admissionProcess, setAdmissionProcess] = useState(admissionProcessData);
	const [documents, setDocuments] = useState(documentsData);
	const [feeStructure, setFeeStructure] = useState(feeStructureData);
	const [faqs, setFaqs] = useState(faqsData);
	const [courseType, setCourseType] = useState("MBBS");
	const [additionalSections, setAdditionalSections] = useState([]);
	const [editingTitleIndex, setEditingTitleIndex] = useState(null); // Track the index of the section being edited
	const [newSectionTitle, setNewSectionTitle] = useState(""); // Track the new title for the section being edited

	useEffect(() => {
		const fetchData = async () => {
			const res = await fetchUniversities(country, currentPage);
			if (currentPage === res.data.total_pages) {
				setLastPage(true);
			}
			if (universities) {
				let temp = res.data.results;
				for (let i = 0; i < temp.length; i++) {
					universities.push(temp[i]);
				}
			} else {
				setUniversities(res.data.results);
			}
			setButtonClicked(false);
		};
		fetchData();
	}, [currentPage]);
	useEffect(() => {
		setAdmissionProcess(admissionProcessData);
		setDocuments(documentsData);
		setFeeStructure(feeStructureData);
		setFaqs(faqsData);
		setAdditionalSections(sectionData);
	}, [
		admissionProcessData,
		documentsData,
		feeStructureData,
		faqsData,
		sectionData,
	]);

	const handleFaqToggle = (index) => {
		const newFaqs = [...faqs];
		newFaqs[index].isOpen = !newFaqs[index].isOpen;
		setFaqs(newFaqs);
	};

	const handleArrayChange = (setter, index, value) => {
		setter((prev) => {
			const newArray = [...prev];
			newArray[index] = value;
			return newArray;
		});
	};

	const handleAddField = (setter) => {
		setter((prev) => [...prev, ""]);
	};

	const handleRemoveField = (setter, index) => {
		setter((prev) => prev.filter((_, i) => i !== index));
	};

	const handleAddFeeField = () => {
		setFeeStructure([
			...feeStructure,
			{ university_name: "", tuitionFee: "", hostelCost: "", annualFees: "" },
		]);
	};

	const handleRemoveFeeField = (index) => {
		setFeeStructure((prev) => prev.filter((_, i) => i !== index));
	};

	const handleFeeChange = (index, key, value) => {
		const updatedFeeStructure = [...feeStructure];
		updatedFeeStructure[index] = {
			...updatedFeeStructure[index],
			[key]: value,
		};
		setFeeStructure(updatedFeeStructure);
	};

	const handleAddFaq = () => {
		setFaqs([...faqs, { question: "", answer: "", isOpen: false }]);
	};

	const handleFaqChange = (index, key, value) => {
		const updatedFaqs = [...faqs];
		updatedFaqs[index] = { ...updatedFaqs[index], [key]: value };
		setFaqs(updatedFaqs);
	};

	const handleRemoveFaq = (index) => {
		setFaqs((prev) => prev.filter((_, i) => i !== index));
	};

	const handleAddSection = () => {
		setAdditionalSections([
			...additionalSections,
			{ title: "", content: [""] },
		]);
	};

	const handleSectionChange = (index, key, value) => {
		const newSections = additionalSections.map((section, i) =>
			i === index ? { ...section, [key]: value } : section
		);
		setAdditionalSections(newSections);
	};

	const handleSectionArrayChange = (sectionIndex, arrayIndex, value) => {
		const newSections = additionalSections.map((section, i) =>
			i === sectionIndex
				? {
						...section,
						content: section.content.map((item, j) =>
							j === arrayIndex ? value : item
						),
					}
				: section
		);
		setAdditionalSections(newSections);
	};

	const handleAddSectionField = (index) => {
		const newSections = additionalSections.map((section, i) =>
			i === index ? { ...section, content: [...section.content, ""] } : section
		);
		setAdditionalSections(newSections);
	};

	const handleRemoveSectionField = (sectionIndex, fieldIndex) => {
		const newSections = additionalSections.map((section, i) =>
			i === sectionIndex
				? {
						...section,
						content: section.content.filter((_, j) => j !== fieldIndex),
					}
				: section
		);
		setAdditionalSections(newSections);
	};

	const startEditingTitle = (index) => {
		setEditingTitleIndex(index);
		setNewSectionTitle(additionalSections[index].title);
	};

	const saveTitle = (index) => {
		const updatedSections = additionalSections.map((section, i) =>
			i === index ? { ...section, title: newSectionTitle } : section
		);
		setAdditionalSections(updatedSections);
		setEditingTitleIndex(null);
	};

	const handleDeleteSection = (index) => {
		setAdditionalSections((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="fade-in">
			<Toast
				description={toastData.description}
				type={toastData.type}
				controller={toastHandler}
				controllerHandlerBoolean={setToastHandler}
				loader={null}
				time={3000}
			/>

			{!universityDetails.name && (
				<div className="h-[80vh] flex justify-center items-center gap-5">
					<LoaderCircle />
					Loading..
				</div>
			)}
			<>
				{isEditMode ? (
					<EditUniversity universityDataDetails={universityDetails} />
				) : (
					<div>
						{universityDetails && universityDetails.name && (
							<div className=" relative w-full min-h-screen lg:pt-20 lg:px-0 px-5 mb-10  font-inter">
								<div className="w-[60%] lg:text-4xl text-4xl h-25  mb-10 text-center font-inter  rounded-[40px] p-4 text-black ml-auto mr-auto">
									{universityDetails.name}
								</div>
								
								{is_admin && loggedInUser && (
									<div className="universities-page">
										<div className="w-full max-w-4xl space-y-8 ">
											{/* Additional Sections */}
											{additionalSections.map((section, index) => (
												<div
													key={index}
													className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
												>
													<div className="mb-4 flex items-center space-x-2">
														{/* <label className="text-sm font-medium">
														Title
													</label> */}
														{editingTitleIndex === index ? (
															<div className="flex items-center space-x-2">
																<input
																	value={newSectionTitle}
																	onChange={(e) =>
																		setNewSectionTitle(e.target.value)
																	}
																	className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm"
																	placeholder="Enter section title"
																/>
																<button
																	type="button"
																	onClick={() => saveTitle(index)}
																	className="inline-flex bg-white-500 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white hover:bg-blue-600 h-10 px-4 py-2"
																>
																	Save
																</button>
															</div>
														) : (
															<div className="flex items-center space-x-2">
																<h3 className="text-xl font-semibold mb-4">
																	{section.title || `Section ${index + 1}`}
																</h3>
																<button
																	type="button"
																	onClick={() => startEditingTitle(index)}
																	className="text-white-500"
																>
																	Edit Title
																</button>
																<button
																	type="button"
																	onClick={() => handleDeleteSection(index)}
																	className="text-white-500"
																>
																	<FaTrashAlt className="w-4 h-4" />
																</button>
															</div>
														)}
													</div>
													{section.content.map((content, contentIndex) => (
														<div
															key={contentIndex}
															className="flex items-center space-x-2 mb-2"
														>
															<input
																value={content}
																onChange={(e) =>
																	handleSectionArrayChange(
																		index,
																		contentIndex,
																		e.target.value
																	)
																}
																className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm"
																placeholder={`Content ${contentIndex + 1}`}
															/>
															<button
																type="button"
																onClick={() =>
																	handleRemoveSectionField(index, contentIndex)
																}
																className="text-white-500"
															>
																<FaTrashAlt className="w-4 h-4" />
															</button>
														</div>
													))}
													<button
														type="button"
														onClick={() => handleAddSectionField(index)}
														className="text-white-500"
													>
														Add Content
													</button>
												</div>
											))}
											<button
												type="button"
												onClick={handleAddSection}
												className="inline-flex bg-green-500 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-white hover:bg-green-600 h-10 px-4 py-2"
											>
												Add New Section
											</button>
										</div>
									</div>
								)}
								<div className="flex justify-start xl:px-44 lg:px-20 items-center w-full">
									<div className="w-full">
										{/*Section-1*/}
										<div className="section">
											<h2>
												Admission Process to study in {universityDetails.name}
											</h2>
											<ul>
												{admissionProcessLoading && (
													<div className="flex justify-center items-center">
														<LoaderCircle /> Loading...
													</div>
												)}
												{admissionProcess &&
													admissionProcess.map((item, index) => (
														<li key={index}>{item.process}d</li>
													))}
											</ul>
										</div>
										<div className="section">
											{/* <h2>
												Requisite documents for a visa to study in {country} for {courseType}
											</h2> */}
											<h2>Requisite documents</h2>
											{documentsLoading && (
												<div className="flex justify-center items-center">
													<LoaderCircle /> Loading...
												</div>
											)}
											<ul>
												{documents &&
													documents.map((item, index) => (
														<li key={index}>{item.document}</li>
													))}
											</ul>
										</div>
										{/* Section 2: Fee Structure */}
										<div className="section">
											{/* <h2>
												{courseType} in {country} Fee Structure: {feeStructure.yearRange}
											</h2> */}
											<h2>{universityDetails.name} Fee Structure:</h2>
											<p>
												The following will throw some light on the affordable
												costs that aspirants will incur as a part of in{" "}
												{universityDetails.name}'s fees structure:
											</p>
											<table>
												<thead>
													<tr>
														<th>Name of the university</th>
														<th>Tuition Fee/Year</th>
														<th>Hostel Approx Cost of Living</th>
														<th>Annual Fees per Year (Food + Education)</th>
													</tr>
												</thead>
												<tbody>
													{feeStructure &&
														feeStructure?.map((fee, index) => (
															<tr key={index}>
																<td>{fee.university_id.university_name}</td>
																<td>{fee.fee || "N/A"} ₹</td>
																<td>{fee.hostel_fee || "N/A"} ₹</td>
																<td>{fee.annual_fee || "N/A"} ₹</td>
															</tr>
														))}
												</tbody>
											</table>
										</div>
										{/* Section 3: FAQs */}
										<div className="section">
											<h2>FAQs - {universityDetails.name}</h2>
											<p className="py-4">
												Here are some of the frequently asked questions that
												might resolve your queries:
											</p>
											{faqsLoading && (
												<div className="flex justify-center items-center">
													<LoaderCircle /> Loading...
												</div>
											)}
											<div className="faqs">
												{faqs &&
													faqs.map((faq, index) => (
														<div
															key={index}
															className="bg-primary rounded-xl faq-item h-max"
														>
															<div className="flex hover:cursor-pointer bg-primary justify-between items-center w-full">
																<div
																	className="p-4 text-white  bg-primary w-full"
																	onClick={() => handleFaqToggle(index)}
																>
																	{faq.question}
																</div>
																<div className="bg-primary">
																	<MdKeyboardArrowDown
																		size={20}
																		className={`mr-5 bg-primary transition-all ease-in-out duration-300 ${faq.isOpen ? "rotate-180" : ""}`}
																		color="white"
																	/>
																</div>
															</div>
															<div
																className={`text-white transition-all ease-in-out duration-300 ${faq.isOpen ? "h-20 max-h-96  p-4" : "h-0 max-h-0"}`}
															>
																{faq.answer}
															</div>
														</div>
													))}
											</div>
										</div>
										{additionalSections &&
											additionalSections.map((section, index) => (
												<div className="section">
													<h2>{section.title}</h2>
													<ul>
														{sectionLoading && (
															<div className="flex justify-center items-center">
																<LoaderCircle /> Loading...
															</div>
														)}
														<li>{section.content}</li>
													</ul>
												</div>
											))}
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</>
		</div>
	);
}
