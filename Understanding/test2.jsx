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
	const perPage = 10;

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetchUniversities(country, currentPage, perPage);
			setUniversities(response.results);
		};
		fetchData();
	}, [country, currentPage, perPage, buttonClicked]);
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [currentPage]);

	const handleEligibilityChange = (index, event) => {
		const newEligibility = [...universityDetails.eligibility];
		newEligibility[index] = event.target.value;
		setUniversityDetails({
			...universityDetails,
			eligibility: newEligibility,
		});
	};
	const handleEligibilityAdd = () => {
		setUniversityDetails({
			...universityDetails,
			eligibility: [...universityDetails.eligibility, ""],
		});
	};
	const handleEligibilityRemove = (index) => {
		const newEligibility = [...universityDetails.eligibility];
		newEligibility.splice(index, 1);
		setUniversityDetails({
			...universityDetails,
			eligibility: newEligibility,
		});
	};

	// Similar handlers for admission process, documents required, fee structure, FAQs, and new sections
	const handleSectionChange = (section, index, event) => {
		const newSections = [...section];
		newSections[index] = event.target.value;
		setSectionDetails(newSections);
	};
	const handleSectionAdd = (section) => {
		setSectionDetails([...section, ""]);
	};
	const handleSectionRemove = (section, index) => {
		const newSections = [...section];
		newSections.splice(index, 1);
		setSectionDetails(newSections);
	};

	return (
		<div>
			<Helmet>
				<title>{universityDetails.name}</title>
			</Helmet>
			<div className="container mx-auto p-5">
				<div className="flex justify-between">
					<h1 className="text-2xl font-bold mb-5">{universityDetails.name}</h1>
					{loggedInUser && is_admin && (
						<button
							className="text-xl"
							onClick={() => setShowDropdown(!showDropDown)}
						>
							<CiSettings />
						</button>
					)}
				</div>
				{showDropDown && is_admin && (
					<div className="dropdown-menu">
						{!isEditMode ? (
							<button
								className="bg-blue-500 text-white py-2 px-4 rounded"
								onClick={handleEditClick}
							>
								Edit
							</button>
						) : (
							<button
								className="bg-blue-500 text-white py-2 px-4 rounded"
								onClick={handleEditClick}
								disabled={savingUniversityStarted}
							>
								{savingUniversityStarted ? "Saving..." : "Save"}
							</button>
						)}
						<button
							className="bg-red-500 text-white py-2 px-4 rounded ml-2"
							onClick={() => handleUniversityDeletion(universityId)}
							disabled={deletingUniversityStarted}
						>
							{deletingUniversityStarted ? "Deleting..." : "Delete"}
						</button>
					</div>
				)}
				<div className="university-details">
					{isEditMode ? (
						<input
							type="text"
							value={universityDetails.name}
							onChange={(e) => handleInputChange(e, "name")}
						/>
					) : (
						<p>{universityDetails.name}</p>
					)}
					{isEditMode ? (
						<textarea
							value={universityDetails.about}
							onChange={(e) => handleInputChange(e, "about")}
						/>
					) : (
						<p>{universityDetails.about}</p>
					)}
					{isEditMode ? (
						<input
							type="file"
							onChange={(e) => handleInputChange(e, "universityLogo")}
						/>
					) : (
						<img
							src={universityDetails.universityLogo}
							alt={universityDetails.name}
						/>
					)}
					<p>{universityDetails.address}</p>
					<p>{universityDetails.country}</p>
				</div>
				{admissionProcessLoading || documentsLoading || feeStructureLoading || faqsLoading || sectionLoading ? (
					<LoaderCircle />
				) : (
					<>
						<div className="eligibility-section">
							<h2 className="text-xl font-bold mb-5">Eligibility Criteria</h2>
							{universityDetails.eligibility.map((item, index) => (
								<div key={index} className="eligibility-item">
									{isEditMode ? (
										<input
											type="text"
											value={item}
											onChange={(e) => handleEligibilityChange(index, e)}
										/>
									) : (
										<p>{item}</p>
									)}
									{isEditMode && (
										<button
											className="bg-red-500 text-white py-1 px-2 rounded ml-2"
											onClick={() => handleEligibilityRemove(index)}
										>
											<FaTrashAlt />
										</button>
									)}
								</div>
							))}
							{isEditMode && (
								<button
									className="bg-green-500 text-white py-1 px-2 rounded"
									onClick={handleEligibilityAdd}
								>
									Add
								</button>
							)}
						</div>
						{/* Add similar sections for Admission Process, Documents Required, Fee Structure, FAQs, and any new sections */}
						{/* Admission Process */}
						<div className="admission-process-section">
							<h2 className="text-xl font-bold mb-5">Admission Process</h2>
							{admissionProcessData.map((item, index) => (
								<div key={index} className="admission-process-item">
									{isEditMode ? (
										<input
											type="text"
											value={item}
											onChange={(e) => handleSectionChange(admissionProcessData, index, e)}
										/>
									) : (
										<p>{item}</p>
									)}
									{isEditMode && (
										<button
											className="bg-red-500 text-white py-1 px-2 rounded ml-2"
											onClick={() => handleSectionRemove(admissionProcessData, index)}
										>
											<FaTrashAlt />
										</button>
									)}
								</div>
							))}
							{isEditMode && (
								<button
									className="bg-green-500 text-white py-1 px-2 rounded"
									onClick={() => handleSectionAdd(admissionProcessData)}
								>
									Add
								</button>
							)}
						</div>
						{/* Documents Required */}
						<div className="documents-required-section">
							<h2 className="text-xl font-bold mb-5">Documents Required</h2>
							{documentsData.map((item, index) => (
								<div key={index} className="documents-required-item">
									{isEditMode ? (
										<input
											type="text"
											value={item}
											onChange={(e) => handleSectionChange(documentsData, index, e)}
										/>
									) : (
										<p>{item}</p>
									)}
									{isEditMode && (
										<button
											className="bg-red-500 text-white py-1 px-2 rounded ml-2"
											onClick={() => handleSectionRemove(documentsData, index)}
										>
											<FaTrashAlt />
										</button>
									)}
								</div>
							))}
							{isEditMode && (
								<button
									className="bg-green-500 text-white py-1 px-2 rounded"
									onClick={() => handleSectionAdd(documentsData)}
								>
									Add
								</button>
							)}
						</div>
						{/* Fee Structure */}
						<div className="fee-structure-section">
							<h2 className="text-xl font-bold mb-5">Fee Structure</h2>
							{feeStructureData.map((item, index) => (
								<div key={index} className="fee-structure-item">
									{isEditMode ? (
										<input
											type="text"
											value={item}
											onChange={(e) => handleSectionChange(feeStructureData, index, e)}
										/>
									) : (
										<p>{item}</p>
									)}
									{isEditMode && (
										<button
											className="bg-red-500 text-white py-1 px-2 rounded ml-2"
											onClick={() => handleSectionRemove(feeStructureData, index)}
										>
											<FaTrashAlt />
										</button>
									)}
								</div>
							))}
							{isEditMode && (
								<button
									className="bg-green-500 text-white py-1 px-2 rounded"
									onClick={() => handleSectionAdd(feeStructureData)}
								>
									Add
								</button>
							)}
						</div>
						{/* FAQs */}
						<div className="faqs-section">
							<h2 className="text-xl font-bold mb-5">FAQs</h2>
							{faqsData.map((item, index) => (
								<div key={index} className="faqs-item">
									{isEditMode ? (
										<input
											type="text"
											value={item}
											onChange={(e) => handleSectionChange(faqsData, index, e)}
										/>
									) : (
										<p>{item}</p>
									)}
									{isEditMode && (
										<button
											className="bg-red-500 text-white py-1 px-2 rounded ml-2"
											onClick={() => handleSectionRemove(faqsData, index)}
										>
											<FaTrashAlt />
										</button>
									)}
								</div>
							))}
							{isEditMode && (
								<button
									className="bg-green-500 text-white py-1 px-2 rounded"
									onClick={() => handleSectionAdd(faqsData)}
								>
									Add
								</button>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};


